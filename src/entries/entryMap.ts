import { VueConstructor } from "vue";
import { Vue } from "vue-property-decorator";

import MineCartEntryView from "@/views/entries/MineCartEntryView.vue";

export const map: { [key: string]: VueConstructor<Vue> } = {
    "mine-cart-madness": MineCartEntryView,
    "settlers-of-the-north-pole": MineCartEntryView
};
