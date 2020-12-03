import Vue, { VueConstructor } from "vue";
import Router, { RouteConfig } from "vue-router";
import Home from "./views/Home.vue";
import Entries from "./views/Entries.vue";
import SimpleEntryTemplate from "./views/entries/SimpleEntryTemplate.vue";
import EntryWithPauseAndRun from "@/views/entries/EntryWithPauseAndRun.vue";

import { entryList, EntryRoute } from "./entries/entryList";
import { map as entryComponentMap } from "./entries/entryMap";
import { e } from 'mathjs';

Vue.use(Router);

const routes: RouteConfig[] = [
  {
    path: "/",
    name: "home",
    component: Home,
    props: {
      years: Object.keys(entryList)
    }
  },
  {
    path: "/entry",
    name: "entries",
    component: Entries
  }
];

const getTemplate = (entry: EntryRoute): VueConstructor<Vue> => {
  if (entry.name in entryComponentMap) {
    return entryComponentMap[entry.name];
  } else if (entry.entry.metadata && entry.entry.metadata.customComponent) {
    if (entry.entry.metadata.customComponent === "pause-and-run") {
      return EntryWithPauseAndRun;
    }
  } 
  return SimpleEntryTemplate;
}

const flat = Object.keys(entryList)
  .map((year) => entryList[year].map((e, index) => ({ entry: e, year })))
  .filter((e) => e);
flat.flatMap((e) => e).forEach((e) => {
  routes.push({
    name: e.entry.name,
    path: `/entry/${e.entry.name}`,
    component: getTemplate(e.entry),
    props: {
      id: e.entry.date,
      title: e.entry.title,
      entry: e.entry.entry,
      year: e.year,
      stars: e.entry.stars || 0
    }
  });
});



export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});
