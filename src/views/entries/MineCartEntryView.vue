<template lang="pug">
    EntryTemplate(:title="title", :id="id", @file-loaded="readFile", :disabled="executing", :year="year")
        .input
            button(@click="nextState", :class="{hidden: !executing}") Next
            button(@click="stop", :class="{hidden: !executing}") Stop
            button(@click="run", :class="{hidden: !executing}") Toggle Run
        .output
            EntrySimpleOutput(:key="$route.path", :lines="output")
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Entry, EntryFileHandling, executeEntry, simpleOutputCallbackFactory } from "../../entries/entry";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
import { setTimeoutAsync } from "../../support/async";
import { isTimeoutMessage } from "../../entries/entryStatusMessages";

@Component({
    components: {
        EntryTemplate,
        EntrySimpleOutput
    }
})
export default class MineCartEntryView extends Vue {
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    @Prop() public year!: number;

    private executing: boolean = false;
    private resolver?: () => void;
    private shouldStop: boolean = false;
    private shouldRun: boolean = false;

    private timeout = 100;

    private output: string[] = [];

    public async readFile(fileHandling: EntryFileHandling) {
        this.shouldRun = false;
        this.shouldStop = false;
        this.executing = true;
        this.output = [];
        this.timeout = 100;
        const that = this;
        try {
            await executeEntry(
                {
                    entry: this.entry,
                    choice: fileHandling.choice,
                    lines: fileHandling.content,
                    outputCallback: simpleOutputCallbackFactory(this.output),
                    isCancelled: () => that.shouldStop,
                    pause: () => {
                        const promise = new Promise<void>((resolve, reject) => {
                            if (this.shouldRun) {
                                setTimeout(resolve, this.timeout);
                            } else {
                                this.resolver = resolve;
                            }
                        });
                        return promise;
                    },
                    statusCallback: async (message) => {
                        if (isTimeoutMessage(message)) {
                            this.timeout = message.timeout;
                        }
                    }
                }
            );
        } catch (e) {
            throw e;
        } finally {
            this.executing = false;
        }
    }

    public stop() {
        this.shouldStop = true;
        this.nextState();
    }

    public run() {
        this.shouldRun = !this.shouldRun;
    }
    public nextState() {
        if (this.resolver) {
            const resolver = this.resolver;
            this.resolver = undefined;
            resolver();
        }
    }
}
</script>


<style lang="scss">
.output {
    display: flex;
    align-items: stretch;
}
</style> 