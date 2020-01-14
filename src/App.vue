<template lang="pug">
#app
  #nav
    .header
      .title Advent of Code
      .author gicali
      hr
    .links
      .years
        Year(v-for="year in years", @click="selectYear(year)", :year="year", :selected="year === selectedYear")
      router-link(to="/") Home
      router-link(:to="{name: 'entries'}") Entries
      .nav-entry
        router-link(:to="{name: 'entries'}", v-if="shouldTruncateList") (...)
        router-link(:to="{name: entry.name}", v-for=("entry in entryList"), :key="entry.name") {{entry.title}}
      router-link(:to="{name: lastEntryName}") Last Entry
  #content
    router-view
</template>

<script lang="ts">
import Year from "./components/Year.vue";
import { Component, Vue } from "vue-property-decorator";
import { entryList, EntryRoute } from "./entries/entryList";
import { baseState, updateYear } from "./state/state";
@Component({
    components: {
        Year
    }
})
export default class App extends Vue {

    private get entryList(): EntryRoute[] {
        const list = this.fullEntryList;
        const reducedList = list.slice(Math.max(0, list.length - 10), list.length);
        return reducedList;
    }

    private get shouldTruncateList(): boolean {
        return this.entryList.length !== this.fullEntryList.length;
    }

    private get fullEntryList(): EntryRoute[] {
        const list = this.entryByYears[this.selectedYear];
        return list;
    }


    private get lastEntryName(): string {
        return this.entryList[this.entryList.length - 1].name;
    }

    private dates = baseState.dates;

    // private selectedYear: number = 2019;
    private get selectedYear(): number {
        return this.dates.year;
    }
    private years = [2018, 2019];

    private entryByYears = entryList;

    private selectYear(year: number) {
        updateYear(year);
    }
}
</script>


<style lang="scss">
$text-color: navajowhite;
@mixin nav-entry {
    font-weight: bold;
    text-decoration: none;
    text-align: left;
    color: $text-color;
    &:not(:first-child) {
        margin-top: 1em;
    }
}

.links {
    .years {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        a {
            cursor: pointer;
            border-bottom: 1px solid navajowhite;
            margin-top: 0em !important;
        }
    }
}

.hidden {
    display: none !important;
}
button {
    padding: 8px 16px;
    box-shadow: inset 0px 0px 0px 1px grey;
    border: none;
    border-radius: 4px;
    background-color: white;
    font-size: 16px;
    cursor: pointer;
}
body {
    margin: 0;
    #app {
        display: flex;
        flex-direction: row;
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        min-height: 100vh;
    }
    #content {
        flex: 1 1 auto;
        padding: 2em;
        max-height: 100%;
        //max-height: 100vh;
        // overflow: hidden;
        // overflow-y: scroll;
        color: #242729;
        display: flex;
        flex-direction: column;
    }
    #nav {
        padding: 20px 20px;
        flex: 0 0 auto;
        background-color: #2c3e50;
        display: flex;
        flex-direction: column;
        color: navajowhite;
        .links {
            display: flex;
            flex-direction: column;
            margin-left: 2em;
        }
        .header {
            margin-top: 2em;
            .title {
                font-weight: bold;
                font-size: 30px;
            }
            .author {
                text-align: end;
                line-height: 1.7;
            }
            margin-bottom: 2em;
            hr {
                border-color: $text-color;
            }
        }
        .links a {
            @include nav-entry;
            &.router-link-exact-active {
                color: #42b983;
            }
        }

        .nav-entry {
            display: flex;
            flex-direction: column;
            @include nav-entry;
            a,
            .nav-entry {
                @include nav-entry;
                margin-left: 2em;
                font-size: 90%;
                font-weight: normal;
            }
        }
    }
}
</style>
