<template lang="pug">
    EntryTemplate(:title="title", :id="id", @file-loaded="readFile", :disabled="executing", :year="year")
        .input(:class="{hidden:!executing}")
            button(@click="nextState", :class="{hidden: !executing}") Next
            button(@click="stop", :class="{hidden: !executing}") Stop
            button(@click="run", :class="{hidden: !executing}") Toggle Run
            input(v-model="timeout" type="number")
        .output
            EntrySimpleOutput(:key="$route.path", :lines="output" @print-factory="readFactory")
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
    Entry,
    EntryFileHandling,
    executeEntry,
    ScreenPrinter,
    simpleOutputCallbackFactory
} from "../../entries/entry";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
import { setTimeoutAsync } from "../../support/async";
import { isTimeoutMessage } from "../../entries/entryStatusMessages";
import { Coordinate } from "../../support/geometry";

@Component({
    components: {
        EntryTemplate,
        EntrySimpleOutput
    }
})
export default class EntryWithPauseAndRun extends Vue {
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

    private requireScreen?: (size?: Coordinate) => Promise<ScreenPrinter>;
    private screenPrinter?: ScreenPrinter;

    public readFactory(factory: (c?: Coordinate) => Promise<ScreenPrinter>) {
        this.requireScreen = async (size?: Coordinate) => {
            const result = await factory(size);
            this.screenPrinter = result;
            return result;
        };
    }

    public async readFile(fileHandling: EntryFileHandling) {
        this.shouldRun = false;
        this.shouldStop = false;
        this.executing = true;
        this.output = [];
        // this.timeout = 100;
        const that = this;
        try {
            let drawingPause: (() => void) | undefined;
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
                                const resolver = drawingPause ? () => {
                                    if (drawingPause) {
                                        drawingPause();
                                        drawingPause = undefined;
                                    }
                                    resolve();
                                } : resolve;
                                if (this.timeout > 0) {
                                    setTimeout(resolver , this.timeout);
                                } else {
                                    resolver();
                                }
                            } else {
                                // const drawingPause = this.screenPrinter ? this.screenPrinter.pause() : () => {};
                                if (!drawingPause && this.screenPrinter) {
                                    drawingPause = this.screenPrinter.pause();
                                }
                                if (this.screenPrinter) {
                                    this.screenPrinter.forceRender();
                                }
                                this.resolver = resolve;
                            }
                        });
                        return promise;
                    },
                    screen: this.requireScreen ? { requireScreen: this.requireScreen } : undefined
                }
            );
        } catch (e) {
            throw e;
        } finally {
            this.executing = false;
            if (this.screenPrinter) {
                this.screenPrinter.stop();
            }
        }
    }

    public stop() {
        this.shouldStop = true;
        this.nextState();
        if (this.screenPrinter) {
            this.screenPrinter.stop();
        }
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