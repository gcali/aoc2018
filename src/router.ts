import Vue, { VueConstructor } from "vue";
import Router, { RouteConfig } from "vue-router";
import Home from "./views/Home.vue";
import Entries from "./views/Entries.vue";
import SimpleEntryTemplate from "./views/entries/SimpleEntryTemplate.vue";
import TicketTranslationView from "@/views/entries/custom/2020/TicketTranslationView.vue";

import { entryList, EntryRoute } from "./entries/entryList";
import { map as entryComponentMap } from "./entries/entryMap";

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
  }
  // else if (entry.entry.metadata && entry.entry.metadata.customComponent) {
  //   if (entry.entry.metadata.customComponent === "pause-and-run") {
  //     return EntryWithPauseAndRun;
  //   } else if (entry.entry.metadata.customComponent === "ticket-translation") {
  //     return TicketTranslationView;
  //   }
  // }
  return SimpleEntryTemplate;
};

const flat = Object.keys(entryList)
  .map((year) => entryList[year].map((entry, index) => ({ entry, year })))
  .filter((k) => k);
flat.flatMap((k) => k).forEach((k) => {
  routes.push({
    name: k.entry.name,
    path: `/entry/${k.entry.name}`,
    component: getTemplate(k.entry),
    props: {
      id: k.entry.date,
      title: k.entry.title,
      entry: k.entry.entry,
      year: k.year,
      stars: k.entry.stars || 0
    }
  });
});



export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});
