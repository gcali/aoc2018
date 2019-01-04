import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Entries from "./views/Entries.vue";
import Frequency from "./views/entries/Frequency.vue";
import SimpleEntryTemplate from "./views/entries/SimpleEntryTemplate.vue";
import { entry as frequencyEntry } from "@/entries/single-entries/frequency";

Vue.use(Router);

export default new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ "./views/About.vue"),
    },
    {
      path: "/entry",
      name: "entries",
      component: Entries
    },
    {
      path: "/entry/frequency",
      name: "frequency",
      component: SimpleEntryTemplate,
      props: {
        id: 1,
        title: "Frequency",
        entry: frequencyEntry
      }
    }
  ],
});
