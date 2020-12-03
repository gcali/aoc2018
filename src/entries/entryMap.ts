import { VueConstructor } from "vue";
import { Vue } from "vue-property-decorator";

import {passwordPhilosophy} from "./single-entries/2020/password-philosophy";
import EntryWithPauseAndRun from "@/views/entries/EntryWithPauseAndRun.vue";

export const map: { [key: string]: VueConstructor<Vue> } = {
    "mine-cart-madness": EntryWithPauseAndRun,
    "settlers-of-the-north-pole": EntryWithPauseAndRun,
    "go-with-the-flow": EntryWithPauseAndRun,
    "safe-cracking": EntryWithPauseAndRun,
    "care-package": EntryWithPauseAndRun,
};
