<template lang="pug">
    EntryTemplate(
        :title="title"
        :id="id"
        :year="year"
        @file-loaded="readFile"
        :disabled="disabled"
        :entryKey="this.entry.metadata.key"
    )
        .quick-run(v-if="supportsQuickRunning")
            label Quick run
            input(type="checkbox" v-model="quickRun" :disabled="executing")
            label(v-if="time") Time: {{time}}
        .output
            EntrySimpleOutput(:key="$route.path", :lines="output" @print-factory="readFactory")
        .input(v-if="showAdditionalInput" )
            input(
                type="text" 
                v-model="inputLine"
                v-on:keyup.enter="sendInput"
                :disabled="!disabled"
            )
            button(@click="sendInput" :disabled="!disabled") Send
            button(@click="sendClose" :disabled="!disabled") Close
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
import {
    Entry,
    executeEntry,
    EntryFileHandling,
    simpleOutputCallbackFactory,
    ScreenPrinter
} from "../../entries/entry";
import { Coordinate } from "../../support/geometry";
import { setTimeoutAsync } from "../../support/async";
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

    private get timeout() {
        if (this.entry.metadata && this.entry.metadata!.suggestedDelay) {
            return this.entry.metadata!.suggestedDelay;
        }
        return 0;
    }

    public get supportsQuickRunning() {
        return this.entry.metadata && this.entry.metadata.supportsQuickRunning;
    }
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    @Prop() public year!: string;

    public output: string[] = [];
    private clearScreen?: () => void;

    private quickRun = false;

    private inputLine: string = "";

    private executing = false;

    private buffer: Array<string | null> = [];
    private resolver: ((s: string | null) => void) | null = null;

    private showInput: boolean = false;
    private disabled: boolean = false;

    private destroying = false;

    private time: string = "";

    private requireScreen?: (size?: Coordinate) => Promise<ScreenPrinter>;

    private stopper?: () => Promise<void>;

    private isCancelled = false;

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

    public readFactory(args: {factory: (c?: Coordinate) => Promise<ScreenPrinter>, clear: () => void}) {
        this.requireScreen = async (size?: Coordinate) => {
            const result = await args.factory(size);
            this.stopper = result.stop;
            return result;
        };
        this.clearScreen = args.clear;
    }

    @Watch("entry")
    public onEntryChanged() {
        this.reset();
        this.quickRun = false;
    }

    public beforeDestroy() {
        this.reset();
        this.destroying = true;
        this.isCancelled = true;
    }

    public async readFile(fileHandling: EntryFileHandling) {
        this.reset();
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
        try {
            this.executing = true;
            const startTime = new Date().getTime();
            await executeEntry({
                entry: this.entry,
                choice: fileHandling.choice,
                lines: fileHandling.content,
                outputCallback: simpleOutputCallbackFactory(this.output, () => this.destroying),
                additionalInputReader,
                screen: this.requireScreen ? { requireScreen: this.requireScreen } : undefined,
                isCancelled: () => this.isCancelled,
                pause: this.createPause(),
                isQuickRunning: this.quickRun,
                stopTimer: () => this.time = `${new Date().getTime() - startTime}ms`
            });
        } finally {
            this.executing = false;
            if (this.stopper) {
                this.stopper();
            }
            this.disabled = false;
        }
    }

    private createPause(): () => Promise<void> {
        let lastPause = 0;
        return async () => {
            if (this.timeout === 0) {
                const current = new Date().getTime();
                if (current - lastPause < 500) {
                    return;
                } else {
                    lastPause = current;
                    await setTimeoutAsync(0);
                }
            } else {
                await setTimeoutAsync(this.timeout);
            }
        };
    }

    private reset() {
        if (this.clearScreen) {
            this.clearScreen();
        }
        this.time = "";
        this.executing = false;
        this.output = [];
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

