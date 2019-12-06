<template lang="pug">
    EntryTemplate(:title="title", :id="id", @file-loaded="readFile", :disabled="executing")
        .input
            button(@click="nextState", :class="{hidden: !executing}") Next
            button(@click="stop", :class="{hidden: !executing}") Stop
        .output
            EntrySimpleOutput(:key="$route.path", :lines="output")
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Entry, EntryFileHandling, executeEntry } from "../../entries/entry";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
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

    private executing: boolean = false;
    private resolver?: () => void;
    private shouldStop: boolean = false;

    private output: string[] = [];

    public async readFile(fileHandling: EntryFileHandling) {
        this.shouldStop = false;
        this.executing = true;
        this.output = [];
        const that = this;
        try {
            await executeEntry(
                this.entry,
                fileHandling.choice,
                fileHandling.content,
                (line, shouldClear) => {
                    if (shouldClear) {
                        this.output = [];
                    }
                    if (line === null) {
                        this.output = [];
                    } else if (typeof line === "string") {
                        this.output.push(line);
                    } else if (Array.isArray(line)) {
                        this.output.push(line.join("\n"));
                    } else {
                        this.output.push(JSON.stringify(line));
                    }
                    return new Promise<void>(
                        resolve => (that.resolver = resolve)
                    );
                },
                () => that.shouldStop
            );
        } catch (e) {
            this.output.push("Error:");
            this.output.push(JSON.stringify(e));
        }
        this.executing = false;
    }

    public stop() {
        this.shouldStop = true;
        this.nextState();
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