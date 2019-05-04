<template lang="pug">
#app
  #nav
    .header
      .title Advent of Code
      .author gicali
      hr
    .links
      router-link(to="/") Home
      //-router-link(to="/about") About 
      router-link(:to="{name: 'entries'}") Entries
      .nav-entry
        //- label Entries
        router-link(:to="{name: entry.name}", v-for=("entry in entryList"), :key="entry.name") {{entry.title}}
  #content
    router-view
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { entryList } from "@/entries/entryList";
@Component({})
export default class App extends Vue {
    private entryList = entryList;
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
        padding: 30px 20px;
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
            margin-top: 1em;
            .title {
                font-weight: bold;
                font-size: 30px;
            }
            .author {
                text-align: end;
                line-height: 1.7;
            }
            margin-bottom: 3em;
            hr {
                border-color: $text-color;
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

        a {
            @include nav-entry;
            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }
}
</style>
