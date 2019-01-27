<template lang="pug">
    .wrapper(:class="{hidden: hideOutput}")
        .output(ref="output") {{text}}
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
@Component({})
export default class EntrySimpleOutput extends Vue {
    @Prop({ default: [] }) public lines!: string[];

    public $refs!: {
        output: HTMLDivElement
    };

    public get hideOutput(): boolean {
        return this.lines.length <= 0;
    }

    public get text() {
        return this.lines.join("\n");
    }

    @Watch("text")
    public onTextChanged(val: string[], oldVal: string[]) {
        this.$refs.output.scrollTop = this.$refs.output.scrollHeight;
    }
}
</script> 

<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    flex: 1 1 auto;
    .output {
        font-family: monospace;
        flex: 0 1 auto;
        overflow-y: scroll;
        align-self: stretch;
        white-space: pre-wrap;
        background-color: #484545;
        color: white;
        border-radius: 4px;
        min-height: 2em;
        padding: 1em;
        max-width: 60em;
    }
}
</style>
