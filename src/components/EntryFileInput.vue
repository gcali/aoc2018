<template lang="pug">
    .file-selection
        button.selection-action(@click="clickSelectionAction", :disabled="disabled") {{this.selectionLabel}}
        input(type="file" ref="file-input" @change="filesUpdated")
        label.selected-file(:class="{hidden: !this.isFileSelected}") {{this.shownName}}
        hr(:class="{hidden: !this.isFileSelected}")
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { readFileFromInput } from "../support/file-reader";
@Component({})
export default class EntryFileInput extends Vue {
    @Prop({ default: false }) public disabled!: boolean;
    @Prop({ default: false }) public readFile!: boolean;
    public shownName: string = "";
    public isFileSelected: boolean = false;

    public clickSelectionAction() {
        this.chooseFile();
    }

    public filesUpdated(e: any) {
        const fileName = this.getFileName();
        if (fileName) {
            this.isFileSelected = true;
            this.shownName = fileName;
            if (this.readFile) {
                const component = this;
                readFileFromInput(this.input!.files![0], (content: string) => {
                    const emitResult = component.$emit("file-content", content);
                });
            }
        }
    }

    public get selectionLabel(): string {
        if (this.isFileSelected) {
            return "Change input file";
        } else {
            return "Select input file";
        }
    }

    private get input() {
        const input = this.$refs["file-input"] as HTMLInputElement;
        return input;
    }

    private getFileName() {
        const input = this.input;
        if (input && input.files) {
            return input.files[0].name;
        } else {
            return null;
        }
    }

    private resetInput() {
        const input = this.input;
        if (input) {
            this.isFileSelected = false;
            input.value = "";
            this.shownName = "";
        }
    }

    private chooseFile() {
        const input = this.input;
        if (input) {
            input.click();
        }
    }
}
</script>


<style lang="scss" scoped>
.file-selection {
    width: auto;
    label {
        font-size: 16px;
    }
    hr {
        margin-top: 2em;
        margin-bottom: 2em;
        width: 50%;
    }
    .selected-file {
        margin-left: 2em;
        background-color: lightgrey;
        border-radius: 4px;
        padding: 8px 16px;
    }
    input {
        display: none;
    }
}
</style>

