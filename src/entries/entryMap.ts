import { VueConstructor } from "vue";
import { Vue } from "vue-property-decorator";
import { Entry } from "./entry";
import {ticketTranslation} from "./single-entries/2020/ticket-translation";
import TicketTranslationView from "../views/entries/custom/2020/TicketTranslationView.vue";
import ConwayCubesView from "../views/entries/custom/2020/ConwayCubesView.vue";
import { conwayCubes } from "./single-entries/2020/conway-cubes";

type EntryMap = {[key: string]: VueConstructor<Vue>};

const buildMap = (tuples: [Entry, VueConstructor<Vue>][]): EntryMap => {
    return tuples.reduce((acc, next) => {
        acc[next[0].metadata!.key] = next[1];
        return acc;
    }, {} as EntryMap);
}

const map2020: EntryMap = buildMap([
    [ticketTranslation, TicketTranslationView],
    [conwayCubes, ConwayCubesView],
])

export const map: { [key: string]: VueConstructor<Vue> } = [
    map2020
].reduce((acc, next) => {
    for (const key in next) {
        acc[key] = next[key];
    }
    return acc;
}, {});
// {
//     // "mine-cart-madness": EntryWithPauseAndRun,
//     // "settlers-of-the-north-pole": EntryWithPauseAndRun,
//     // "go-with-the-flow": EntryWithPauseAndRun,
//     // "safe-cracking": EntryWithPauseAndRun,
//     // "care-package": EntryWithPauseAndRun,
// };
