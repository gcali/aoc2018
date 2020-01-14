<template lang="pug">
    a.year-wrapper(@click="$emit('click')")
        span(v-if="selected") >
        span {{year}}
        span(v-if="selected") <
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: {
        year: Number,
        selected: Boolean
    }
});
</script>

<style>
</style>