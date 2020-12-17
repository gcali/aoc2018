<template lang="pug">
    BaseMessageTemplate(
        :title="title"
        :id="id"
        :year="year"
        :entry="entry"
        :messageHandler="messageHandler"
        :additionalReset="reset"
    )
        .grid(v-if="showGrid")
            .header
                .slider
                    label Time
                    input(type="range" :min="minTime" :max="maxTime" v-model.number="time")
                .slider
                    label Depth
                    input(type="range" :min="minDepth" :max="maxDepth" v-model.number="depth")
                .slider(v-if="this.get4dData")
                    label Hyper
                    input(type="range" :min="minHyper" :max="maxHyper" v-model.number="hyper")
            .grid-output
                .grid-line(v-for="(line, index) in this.getData()" :key="index")
                    .grid-cell(v-for="(cell, index) in line" :key="index") {{cell === " " ? "." : cell}}
                
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import {
    Entry, MessageSender,
} from "../../../../entries/entry";
import BaseMessageTemplate from "../BaseMessageTemplate.vue";
import {isConwayCubesMessage} from "../../../../entries/single-entries/2020/conway-cubes/communication";
import { NotImplementedError } from "../../../../support/error";

@Component({
    components: {
        BaseMessageTemplate
    }
})
export default class ConwayCubesView extends Vue {

@Prop({required: false, default: undefined}) public messageHandlerSetter?: (sender: MessageSender) => void;
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    @Prop() public year!: number;

    public showGrid = false;
    public minDepth = 0;
    public maxDepth = 0;

    public minHyper = 0;
    public maxHyper = 0;
    public hyper = 0;

    public minTime = 0;
    public maxTime = 0;

    private time = 0;
    private depth = 0;

    private get3dData?: (time: number, depth: number) => string[][];
    private get4dData?: (time: number, depth: number, hyper: number) => string[][];

    private reset() {
        this.showGrid = false;
        this.minDepth = 0;
        this.maxDepth = 0;
        this.minHyper = 0;
        this.maxHyper = 0;
        this.minTime = 0;
        this.maxTime = 0;
        this.time = 0;
        this.depth = 0;
        this.hyper = 0;
        this.get3dData = undefined;
        this.get4dData = undefined;
    }
    private async messageHandler(message: any): Promise<void> {
        if (!isConwayCubesMessage(message)) {
            throw new Error("Invalid message");
        }
        if (message.type === "3d") {
            this.minDepth = message.minDepth;
            this.maxDepth = message.maxDepth;
            this.maxTime = message.maxTime;
            this.time = Math.min(this.maxTime, this.time);
            this.depth = Math.max(this.minDepth, Math.min(this.depth, this.maxDepth));
            this.get3dData = message.data as ((time: number, depth: number) => string[][]);
        } else if (message.type === "4d") {
            this.minDepth = message.minDepth;
            this.maxDepth = message.maxDepth;
            this.minHyper = message.minHyper!;
            this.maxHyper = message.maxHyper!;
            this.maxTime = message.maxTime;
            this.time = Math.min(this.maxTime, this.time);
            this.depth = Math.max(this.minDepth, Math.min(this.depth, this.maxDepth));
            this.hyper = Math.max(this.minHyper, Math.min(this.hyper, this.maxHyper));
            this.get4dData = message.data as ((time: number, depth: number, hyper: number) => string[][]);
        } else {
            throw new NotImplementedError();
        }
        this.showGrid = true;
    }
    public getData(): string[][] {
        if (!this.showGrid) {
            return [];
        }
        if (this.get3dData) {
            return this.get3dData(this.time, this.depth);
        } else if (this.get4dData) {
            return this.get4dData(this.time, this.depth, this.hyper);
        }
        throw new NotImplementedError();
    }

}
</script>


<style lang="scss" scoped>
.grid {
    display: flex;
    flex-direction: column;
    .header {
        display: flex;
        flex-direction: row;
    }
    .grid-output {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-family: monospace;
        .grid-line {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
    }
}
</style> 

