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
  },
  {
    path: "/entry",
    name: "entries",
    component: Entries
  }
];

// name: "mine-cart-madness",
const flat = [entryList["2018"], entryList["2019"]].filter(e => e);
flat.flatMap(e => e).forEach((e, index) => {
  routes.push({
    name: e.name,
    path: `/entry/${e.name}`,
    component: e.hasCustomComponent ? entryComponentMap[e.name] : SimpleEntryTemplate,
    props: {
      id: index + 1,
      title: e.title,
      entry: e.entry
    }
  });
});



export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
  // routes: [
  //   {
  //     path: "/",
  //     name: "home",
  //     component: Home,
  //   },
  //   {
  //     path: "/entry",
  //     name: "entries",
  //     component: Entries
  //   },
  //   {
  //     path: "/entry/frequency",
  //     name: "frequency",
  //     component: SimpleEntryTemplate,
  //     props: {
  //       id: 1,
  //       title: "Frequency",
  //       entry: frequencyEntry
  //     }
  //   },
  //   {
  //     path: "/entry/inventory",
  //     name: "inventory",
  //     component: SimpleEntryTemplate,
  //     props: {
  //       id: 2,
  //       title: "Inventory Management System",
  //       entry: inventoryEntry
  //     }
  //   }
  // ],
});
