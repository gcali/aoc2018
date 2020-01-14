<template lang="pug">
  .home
    | Solutions for the Advent of Code
    .year-list
        router-link(:to="{name: 'entries'}", v-for="year in years" :key="year")
            div(@click="selectYear(year)").year-entry {{year}}
</template>

<script lang="ts">
import Vue from "vue";
import { updateYear } from "../state/state";
export default Vue.extend({
    props: {
        years: Array as () => string[]
    },
    methods: {
        selectYear(year: string) {
            updateYear(year);
        }
    }
});
</script>

<style lang="scss" scoped>
.year-list {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    @include small-screen {
        justify-content: space-evenly;
    }
    align-items: center;
    .year-entry {
        margin: 0em 1em;
        &:first-child {
            margin-left: 0em;
        }
        border: 1px solid black;
        padding: 1em 2em;
        border-radius: 1px;
    }
}
</style>
