<template lang="pug">
  .home
    .page
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
.home {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    .page {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
.year-list {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    flex-wrap: wrap;
    max-width: 30em;
    .year-entry {
        margin: 0em 1em;
        margin-bottom: 1em;
        &:first-child {
            margin-left: 0em;
        }
        border: 1px solid black;
        padding: 1em 2em;
        border-radius: 2px;
        box-shadow: 1px 1px 1px 0 lightgrey;
    }
}
</style>
