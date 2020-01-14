<template lang="pug">
  #nav
    .header
      .title Advent of Code
      .author gicali
      Hamburger.hamburger(:size="25", @click="toggleNavbar")
    hr
    .links(:style="navbarStyle")
      .years
        Year(v-for="year in years", :key="year" @click="selectYear(year)", :year="year", :selected="year === selectedYear")
      router-link(to="/") Home
      router-link(:to="{name: 'entries'}") Entries
      .nav-entry
        router-link(:to="{name: 'entries'}", v-if="shouldTruncateList") (...)
        router-link(:to="{name: entry.name}", v-for=("entry in entryList"), :key="entry.name") {{entry.title}}
      router-link(:to="{name: lastEntryName}") Last Entry
    
</template>

<script lang="ts">
import Vue from "vue";

import Hamburger from "./Hamburger.vue";
import Year from "./Year.vue";
import { EntryRoute } from "../entries/entryList";
import { baseState, updateYear } from "../state/state";

export default Vue.extend({
    components: {
        Year,
        Hamburger
    },
    props: {
        entryByYears: Object as () => { [key: string]: EntryRoute[] }
    },
    watch: {
        $route(to, from) {
            this.navbarActivated = false;
        }
    },
    data() {
        return {
            dates: baseState.dates,
            navbarActivated: false
        };
    },
    methods: {
        selectYear(year: number) {
            updateYear(year);
        },
        toggleNavbar() {
            this.navbarActivated = !this.navbarActivated;
        }
    },
    computed: {
        entryList(): EntryRoute[] {
            const list = this.fullEntryList;
            const reducedList = list.slice(Math.max(0, list.length - 10), list.length);
            return reducedList;
        },
        fullEntryList(): EntryRoute[] {
            return this.entryByYears[this.selectedYear + ""];
        },
        selectedYear(): number {
            return this.dates.year;
        },
        shouldTruncateList(): boolean {
            return this.entryList.length !== this.fullEntryList.length;
        },
        lastEntryName(): string {
            return this.entryList[this.entryList.length - 1].name;
        },
        years(): number[] {
            return Object.keys(this.entryByYears).map((e) => parseInt(e, 10));
        },
        navbarStyle() {
            if (!this.navbarActivated) {
                return {
                    left: "-60vw"
                };
            } else {
                return {
                    left: "0"
                };
            }
        }
    }
});
</script>

<style lang="scss">
#nav {
    @mixin nav-entry {
        font-weight: bold;
        text-decoration: none;
        text-align: left;
        color: $text-color;
        &:not(:first-child) {
            margin-top: 1em;
        }
    }

    $header-height: 100px;

    padding: 20px 20px;
    @include small-screen {
        padding: 0;
    }
    flex: 0 0 auto;
    background-color: $dark-color;
    display: flex;
    flex-direction: column;
    color: $text-color;
    .links {
        @include small-screen {
            background-color: $navbar-color;
            position: fixed;
            width: 60vw;
            margin: 0;
            top: $header-height;
            height: calc(100vh - #{$header-height});
            padding: 2em 1em;
            box-sizing: border-box;
            transition: 0.5s;
        }
        display: flex;
        flex-direction: column;
        margin-left: 2em;
        margin-top: 2em;
        a {
            @include nav-entry;
            &.router-link-exact-active {
                color: $highlight-color;
            }
        }
        .years {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            a {
                cursor: pointer;
                border-bottom: 1px solid $text-color;
                margin-top: 0em !important;
            }
            @include small-screen {
                margin-bottom: 2em;
            }
        }
    }
    hr {
        border-color: $text-color;
        width: 100%;
        @include small-screen {
            display: none;
        }
    }
    .header {
        margin-top: 2em;
        position: relative;
        .title {
            font-weight: bold;
            font-size: 30px;
        }
        .author {
            text-align: end;
            line-height: 1.7;
        }
        .hamburger {
            display: none;
            @include small-screen {
                display: block;
                position: absolute;
                bottom: 0.2em;
                left: 1em;
            }
        }
        @include small-screen {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            // margin: 2em 1em;
            margin: 0;
            padding: 2em 1em;
            box-sizing: border-box;
            height: $header-height;
        }
    }
    .nav-entry {
        display: flex;
        @include small-screen {
            display: none;
        }
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
</style>