<template lang="pug">
    .wrapper
        .header Entries
            hr

        .entries
            ul
                li(v-for="entry in entries" :key="entry.name")
                    router-link(:to="{name: entry.name}") {{entry.title}}
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { entryList } from "../entries/entryList";

interface Entry {
    name: string;
    title: string;
}

@Component({})
export default class Entries extends Vue {
    public entries: Entry[] = [entryList["2018"], entryList["2019"]].flatMap(
        e => e
    );
}
</script>
