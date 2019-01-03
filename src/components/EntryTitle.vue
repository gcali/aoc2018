<template lang="pug">
    .title
        .date {{fullDate}}
        .name {{name}}
        hr
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ordinalOf } from "@/support/string";
@Component({})
export default class EntryTitle extends Vue {
    @Prop() private date!: number;
    @Prop() private name!: string;
    private get fullDate() {
        return `December ${ordinalOf(this.date)}, 2018`;
    }
}
</script>

<style lang="scss" scoped>
.title {
    align-self: stretch;
    margin-bottom: 3em;
    .date {
        font-size: 15px;
    }
    .name {
        line-height: 2;
        font-size: 30px;
    }
    hr {
        border-style: solid;
    }
}
</style>
