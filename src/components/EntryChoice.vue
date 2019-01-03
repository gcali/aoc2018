<template lang="pug">
.entry-choice(:class="{hidden: hidden}")
    label.question Which entry?
    .choices
        label 
            input(type="radio", value="first", v-model="choice")
            | First
        label 
            input(type="radio", value="second", v-model="choice")
            | Second
    button(@click="show") Execute
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component({})
export default class EntryChoice extends Vue {
    @Prop({ default: false }) public hidden!: boolean;
    private choice: string = "first";
    public show() {
        this.$emit("execute", this.choice);
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
