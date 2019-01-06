<template lang="pug">
    div.wrapper
        EntryTitle(:date="id", :name="title")
        .content
            EntryFileInput(readFile="true", @file-content="readFileContent")
            .choices(:class="{hidden: hideChoices}")
                EntryChoice(@execute="execute")
        .output(:class="{hidden: hideOutput}")
            EntrySimpleOutput(:lines="output")

</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import EntryTitle from "@/components/EntryTitle.vue";
import EntryFileInput from "@/components/EntryFileInput.vue";
import EntryChoice from "@/components/EntryChoice.vue";
import EntrySimpleOutput from "@/components/EntrySimpleOutput.vue";
// import { entry } from "@/entries/single-entries/frequency";
import { Entry } from "@/entries/entry";
@Component({
    components: {
        EntryTitle,
        EntryFileInput,
        EntryChoice,
        EntrySimpleOutput
    }
})
export default class Frequency extends Vue {
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Prop() public entry!: Entry;
    public output: string[] = [];
    // public outputHeader: string = "";
    private inputContent: string | null = null;
    public get hideOutput(): boolean {
        return this.output.length <= 0;
    }
    public get hideChoices(): boolean {
        return this.inputContent === null;
    }
    public readFileContent(content: string) {
        this.inputContent = content;
    }
    public execute(choice: string) {
        if (this.inputContent) {
            let contentToSplit = this.inputContent;
            if (contentToSplit.endsWith("\n")) {
                contentToSplit = contentToSplit.slice(
                    0,
                    contentToSplit.length - 1
                );
            }
            const splitContent = contentToSplit.split("\n");
            this.output = [];
            if (choice === "first") {
                this.entry.first(splitContent, (outputLine) =>
                    this.output.push(outputLine)
                );
            } else if (choice === "second") {
                this.entry.second(splitContent, (outputLine) =>
                    this.output.push(outputLine)
                );
            } else {
                this.output = ["INVALID CHOICE"];
            }
        }
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

