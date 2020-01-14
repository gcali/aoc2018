<template lang="pug">
    .hamburger(@click="$emit('click')")
        .hamburger-line(:style="lineStyle")
        .hamburger-line(:style="lineStyle")
        .hamburger-line(:style="lineStyle")
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({

    props: {
        size: Number
    },
    computed: {
        lineStyle() {
            return {
                width: `${this.size}px`,
                height: `${this.size as number / 6}px`,
                margin: `${this.size as number / 6}px 0`
            };
        }
    }

});
</script>

<style lang="scss">
.hamburger-line {
    background-color: $text-color;
}
</style>