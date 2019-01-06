<template lang="pug">
    .wrapper
        .output {{text}}
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({})
export default class EntrySimpleOutput extends Vue {
    @Prop({ default: [] }) public lines!: string[];

    public get text() {
        return this.lines.join("\n");
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
        flex: 0 1 auto;
        overflow-y: scroll;
        align-self: stretch;
        white-space: pre-wrap;
        background-color: #484545;
        color: white;
        border-radius: 4px;
        min-height: 2em;
        padding: 1em;
        max-width: 40em;
    }
}
</style>
