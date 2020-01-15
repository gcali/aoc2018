<template lang="pug">
    EntryTemplate(:title="title", :id="id", :year="year", @file-loaded="readFile", :disabled="disabled")
        .output
            EntrySimpleOutput(:key="$route.path", :lines="output")
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import EntryTemplate from "@/components/EntryTemplate.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
import {
    Entry,
    executeEntry,
    EntryFileHandling,
    simpleOutputCallbackFactory
} from "../../entries/entry";
@Component({
    components: {
        EntryTemplate,
        EntrySimpleOutput
    }
})
export default class SimpleEntryTemplate extends Vue {
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    @Prop() public year!: string;

    public output: string[] = [];
    private disabled: boolean = false;
    @Watch("$route")
    public onRouteChanged() {
        this.output = [];
    }
    public async readFile(fileHandling: EntryFileHandling) {
        this.output = [];
        this.disabled = true;
        await executeEntry({
            entry: this.entry,
            choice: fileHandling.choice,
            lines: fileHandling.content,
            outputCallback: simpleOutputCallbackFactory(this.output)
        });
        this.disabled = false;
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
        align-items: stretch;
    }
}
</style>

