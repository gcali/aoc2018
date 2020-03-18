<template lang="pug">
    .wrapper
        ul.entries
                li(v-for="entry in entries" :key="entry.name")
                    CalendarEntry(:title="entry.title", :date="entry.date", :name="entry.name")
                    //- router-link(:to="{name: entry.name}") {{entry.title}}
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { entryList } from "../entries/entryList";
import { baseState } from "../state/state";

import CalendarEntry from "../components/CalendarEntry.vue";

interface Entry {
    name: string;
    title: string;
}

@Component({
    components: { CalendarEntry }
})
export default class Entries extends Vue {

    private dates = baseState.dates;

    public get entries(): Entry[] {
        return entryList[this.dates.year + ""];
    }
    // public entries: Entry[] = [entryList["2018"], entryList["2019"]].flatMap(
    //     e => e
    // );
}
</script>

<style lang="scss">
.entries {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    li {
        display: flex;
    }
}
</style>
