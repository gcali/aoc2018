<template lang="pug">
    router-link(:to="{name: name}").calendar-cell
        .header {{ordinalDate}}
        .title {{title}}
        .stars
            .star(v-for="star in starObjects" :key="star.key") 
                span(:style="{visibility: star.isFull ? 'visible' : 'hidden'}") ⭐
</template>

<script lang="ts">
import Vue from "vue";
import { baseState } from "../state/state";
import { ordinalOf } from "../support/string";
export default Vue.extend({
    props: {
        title: String,
        date: Number,
        name: String,
        stars: Number,
    },
    data() {
        return {
            dates: baseState.dates
        };
    },
    computed: {
        ordinalDate(): string {
            return ordinalOf(this.date);
        },
        starObjects(): Array<{key: number, isFull: boolean}> {
            return [...Array(2).keys()].map((i) => ({
                key: i,
                isFull: i < this.stars
            }));
        }

    }
});
</script>

<style scoped>
.calendar-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid black;
    border-radius: 3px;
    margin: 1em;
    overflow: hidden;
    text-decoration: none;
}

.calendar-cell .header {
    padding-top: 0.5em;
    text-align: center;
    padding-bottom: 0.5em;
    background-color: #d21111;
    color: white;
    width: 200%;
    font-weight: bold;
}

.calendar-cell .title {
    /* border-top: 1px solid black; */
    width: 10em;
    text-align: center;
    padding: 1em;
    padding-bottom: 0.5em;
    margin-left: 0.5em;
    margin-right: 0.5em;
    flex-grow: 1;
}
.calendar-cell .stars {
    display: flex;
    align-items: center;
    padding-bottom: 1em;
}
</style>