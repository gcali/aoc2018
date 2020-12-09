<template lang="pug">
    .input
        EntryFileInput(
            readFile="true",
            @file-content="readFileContent",
            :disabled="disabled"
            v-if="!noInput"
        )
        div(v-else :style="{marginBottom: '1em'}") No input available: 
            | you cannot select your input for the current year in order to avoid cheating!
        .choices(:class="{hidden: hideChoices}")
            EntryChoice(:key="this.$route.path", @execute="loadFile", :disabled="disabled")
</template>

<script lang="ts">
import EntryFileInput from "@/components/EntryFileInput.vue";
import EntryChoice from "@/components/EntryChoice.vue";
import { Component, Vue, Emit, Prop } from "vue-property-decorator";
import { Choice } from "../constants/choice";
import { EntryFileHandling } from "../entries/entry";
import { embeddedLines } from "../entries/embeddedData";

@Component({
    components: {
        EntryFileInput,
        EntryChoice
    }
})
export default class EntryInput extends Vue {
    @Prop({ default: false }) public disabled!: boolean;
    @Prop({required: true, default: ""}) public entryKey!: string;

    private inputContent: string | null = null;

    public get noInput(): boolean {
        return this.entryKey in embeddedLines;
    }

    public get hideChoices(): boolean {
        return this.inputContent === null && !this.noInput;
    }

    public readFileContent(content: string) {
        this.inputContent = content;
    }

    @Emit("file-loaded")
    public async loadFile(choice: Choice): Promise<EntryFileHandling> {
        if (this.noInput) {
            const content = await (embeddedLines[this.entryKey] || (async () => [] as string[]))();
            return {choice, content };
        }
        if (!this.inputContent) {
            throw Error("No file was read");
        }

        let contentToSplit = this.inputContent;
        if (contentToSplit.endsWith("\n")) {
            contentToSplit = contentToSplit.slice(0, contentToSplit.length - 1);
        }
        const splitContent = contentToSplit.split("\n");

        return {
            choice,
            content: splitContent
        };
    }
}
</script>

<style lang="scss" scoped>
.input {
    // display: flex;
    // flex-direction: column;
    .choices {
        margin-bottom: 2em;
    }
}
</style>

