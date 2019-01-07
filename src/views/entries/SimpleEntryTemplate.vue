<template lang="pug">
    EntryTemplate(:title="title", :id="id", @file-loaded="readFile")
        .output
            EntrySimpleOutput(:lines="output")
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
import { Entry, executeEntry, EntryFileHandling } from "@/entries/entry";
@Component({
    components: {
        EntryTemplate,
        EntrySimpleOutput
    }
})
export default class Frequency extends Vue {
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    public output: string[] = [];
    public readFile(fileHandling: EntryFileHandling) {
        this.output = [];
        executeEntry(this.entry, fileHandling.choice, fileHandling.content, this.output);
    }
}
</script>


<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    .content {
        display: flex;
        flex-direction: column;
        .choices {
            margin-bottom: 2em;
        }
    }
    .output {
        display: flex;
    }
}
</style>
