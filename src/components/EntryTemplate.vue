<template lang="pug">
    div.wrapper
        EntryTitle(:date="id", :name="title")
        EntryInput(:key="$route.path", @file-loaded="fileLoaded")
        slot
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import EntryTitle from "@/components/EntryTitle.vue";
import EntryInput from "@/components/EntryInput.vue";
import { EntryFileHandling, executeEntry } from "@/entries/entry";
@Component({
    components: {
        EntryTitle,
        EntryInput,
    }
})
export default class EntryTemplate extends Vue {
    @Prop() public title!: string;
    @Prop() public id!: number;
    @Emit("file-loaded")
    public fileLoaded(fileHandling: EntryFileHandling) {
        return fileHandling;
    }
}
</script>


<style lang="scss" scoped>
.wrapper {
    display: flex;
    flex-direction: column;
}
</style>


