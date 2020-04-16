<template lang="pug">
    EntryTemplate(:title="title", :id="id", :year="year", @file-loaded="readFile", :disabled="disabled")
        .output
            EntrySimpleOutput(:key="$route.path", :lines="output")
        .input(v-if="showAdditionalInput")
            input(
                type="text" 
                v-model="inputLine"
                v-on:keyup.enter="sendInput"
            )
            button(@click="sendInput") Send
            button(@click="sendClose") Close
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
import {
    Entry,
    executeEntry,
    EntryFileHandling,
    simpleOutputCallbackFactory
} from "../../entries/entry";
@Component({
    components: {
        EntryTemplate,
        EntrySimpleOutput
    }
})
export default class SimpleEntryTemplate extends Vue {

    public get showAdditionalInput(): boolean {
        const hasAdditionalInput = (this.entry.metadata !== undefined) &&
            (this.entry.metadata.hasAdditionalInput === true);
        return hasAdditionalInput && this.showInput;
    }
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    @Prop() public year!: string;

    public output: string[] = [];

    private inputLine: string = "";

    private buffer: Array<string | null> = [];
    private resolver: ((s: string | null) => void) | null = null;

    private showInput: boolean = false;
    private disabled: boolean = false;

    public sendInput() {
        const line = this.inputLine;
        this.inputLine = "";
        this.sendLine(line);
    }

    public sendClose() {
        this.sendLine(null);
    }

    @Watch("$route")
    public onRouteChanged() {
        this.output = [];
    }
    public async readFile(fileHandling: EntryFileHandling) {
        this.output = [];
        this.disabled = true;
        this.showInput = true;
        const additionalInputReader = this.showAdditionalInput ?
            {
                close: () => {
                    this.showInput = false;
                },
                read: async () => {
                    if (this.buffer.length > 0) {
                        const res = this.buffer.shift()!;
                        return res;
                    }
                    return await new Promise<string|null>((resolve, reject) => this.resolver = resolve);
                }
            } : undefined;
        await executeEntry({
            entry: this.entry,
            choice: fileHandling.choice,
            lines: fileHandling.content,
            outputCallback: simpleOutputCallbackFactory(this.output),
            additionalInputReader
        });
        this.disabled = false;
    }

    private sendLine(line: string | null) {
        if (this.resolver !== null) {
            const r = this.resolver;
            this.resolver = null;
            r(line);
        } else {
            this.buffer.push(line);
        }
    }

}
</script>


<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    .content {
        display: flex;
        flex-direction: column;
        .choices {
            margin-bottom: 2em;
        }
    }
    .input {
        display: flex;
        input {
            margin-right: 1em;
        }
        margin-top: 1em;
    }
    .output {
        display: flex;
        align-items: stretch;
    }
}
</style>

