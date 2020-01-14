<template lang="pug">
.entry-choice(:class="{hidden: hidden}")
    label.question Which entry?
    .choices
        label 
            input(type="radio", value="first", v-model="choice", :disabled="disabled")
            | First
        label 
            input(type="radio", value="second", v-model="choice", :disabled="disabled")
            | Second
    button(@click="show", :disabled="disabled") Execute
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({})
export default class EntryChoice extends Vue {
    @Prop({ default: false }) public hidden!: boolean;
    @Prop({ default: false }) public disabled!: boolean;
    private choice: string = "first";
    public show() {
        const emitResult = this.$emit("execute", this.choice);
    }
}
</script>

<style lang="scss" scoped>
.entry-choice {
    display: flex;
    align-items: center;
    .question {
        margin-right: 1em;
    }
    label {
        margin-right: 0.5em;
    }
    .choices {
        margin-right: 1em;
    }
}
</style>
