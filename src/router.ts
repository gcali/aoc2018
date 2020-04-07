import Vue, { VueConstructor } from "vue";
import Router, { RouteConfig } from "vue-router";
import Home from "./views/Home.vue";
import Entries from "./views/Entries.vue";
import SimpleEntryTemplate from "./views/entries/SimpleEntryTemplate.vue";

import { entryList } from "./entries/entryList";
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

// name: "mine-cart-madness",
const flat = Object.keys(entryList)
  .map((year) => entryList[year].map((e, index) => ({ entry: e, year })))
  .filter((e) => e);
flat.flatMap((e) => e).forEach((e) => {
  routes.push({
    name: e.entry.name,
    path: `/entry/${e.entry.name}`,
    component: e.entry.hasCustomComponent ? entryComponentMap[e.entry.name] : SimpleEntryTemplate,
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
