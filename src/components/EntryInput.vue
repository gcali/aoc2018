<template lang="pug">
    .input
        EntryFileInput(:key="this.$route.path", readFile="true", @file-content="readFileContent")
        .choices(:class="{hidden: hideChoices}")
            EntryChoice(:key="this.$route.path", @execute="loadFile")
</template>

<script lang="ts">
import EntryFileInput from "@/components/EntryFileInput.vue";
import EntryChoice from "@/components/EntryChoice.vue";
import { Component, Vue, Emit } from "vue-property-decorator";
import { Choice } from "@/constants/choice";
import { EntryFileHandling } from "@/entries/entry";

@Component({
    components: {
        EntryFileInput,
        EntryChoice
    }
})
export default class EntryInput extends Vue {

    private inputContent: string | null = null;

    public get hideChoices(): boolean {
        return this.inputContent === null;
    }

    public readFileContent(content: string) {
        this.inputContent = content;
    }

    @Emit("file-loaded")
    public loadFile(choice: Choice): EntryFileHandling {
        if (!this.inputContent) {
            throw Error("No file was read");
        }

        let contentToSplit = this.inputContent;
        if (contentToSplit.endsWith("\n")) {
            contentToSplit = contentToSplit.slice(
                0,
                contentToSplit.length - 1
            );
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
    display: flex;
    flex-direction: column;
    .choices {
        margin-bottom: 2em;
    }
}
</style>

