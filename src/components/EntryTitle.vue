<template lang="pug">
.title
    .date {{ fullDate }}
    .name {{ name }}
        a.link(:href="link", target="_blank")
            font-awesome-icon(icon="link")
    hr
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { ordinalOf } from "../support/string";
@Component({})
export default class EntryTitle extends Vue {
    @Prop() private date!: number;
    @Prop() private name!: string;
    @Prop() private year!: string;
    private get fullDate() {
        return `December ${ordinalOf(this.date)}, ${this.year}`;
    }

    private get link() {
        return `https://adventofcode.com/${this.year}/day/${this.date}`;
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
        .link {
            margin-left: 0.5em;
            color: lightgrey;
            font-size: 80%;
            &:hover {
                color: $dark-color;
            }
        }
    }
    hr {
        border-style: solid;
    }
}
</style>
