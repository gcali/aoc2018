import Vue, { VueConstructor } from "vue";
import Router, { RouteConfig } from "vue-router";
import Home from "./views/Home.vue";
import Entries from "./views/Entries.vue";
import SimpleEntryTemplate from "./views/entries/SimpleEntryTemplate.vue";
import { entry as frequencyEntry } from "@/entries/single-entries/frequency";
import { entry as inventoryEntry } from "@/entries/single-entries/inventory";

import { entryList } from "@/entries/entryList";

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

const entryComponentMap: { [key: string]: VueConstructor<Vue> } = {};

// name: "mine-cart-madness",
entryList.forEach((e, index) => routes.push({
  name: e.name,
  path: `/entry/${e.name}`,
  component: e.hasCustomComponent ? entryComponentMap[e.name] : SimpleEntryTemplate,
  props: {
    id: index + 1,
    title: e.title,
    entry: e.entry
  }
}));



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
