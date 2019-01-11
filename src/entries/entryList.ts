import { Entry } from "./entry";
import { entry as frequencyEntry } from "./single-entries/frequency";
import { entry as inventoryEntry } from "./single-entries/inventory";
import { entry as matterSliceEntry } from "./single-entries/no-matter-how-you-slice-it";
import { entry as reposeRecordEntry } from "./single-entries/repose-record";
import { entry as alchemicalReduction } from "./single-entries/alchemical-reduction";
import { entry as chronalCoordinates } from "./single-entries/chronal-coordinates";
import { entry as sumParts } from "./single-entries/the-sum-of-its-parts";
import { entry as memoryManeuver } from "./single-entries/memory-maneuver";
import { entry as marbleMania } from "./single-entries/marble-mania";
import { entry as starsAlign } from "./single-entries/the-stars-align";
import { entry as chronalCharge } from "./single-entries/chronal-charge";
import { entry as subterranean } from "./single-entries/subterranean";
import { entry as mineCart } from "./single-entries/mine-cart-madness";
import { entry as chocolateCharts } from "./single-entries/chocolate-charts";

interface EntryRoute {
    name: string;
    title: string;
    entry: Entry;
    hasCustomComponent?: boolean;
}

export const entryList: EntryRoute[] = [
    {
        name: "frequency",
        title: "Chronal Calibration",
        entry: frequencyEntry
    },
    {
        name: "inventory",
        title: "Inventory Management System",
        entry: inventoryEntry
    },
    {
        name: "no-matter-how-you-slice-it",
        title: "No Matter How You Slice It",
        entry: matterSliceEntry
    },
    {
        name: "repose-record",
        title: "Repose Record",
        entry: reposeRecordEntry
    },
    {
        name: "alchemical-reduction",
        title: "Alchemical Reduction",
        entry: alchemicalReduction
    },
    {
        name: "chronal-coordinates",
        title: "Chronal Coordinates",
        entry: chronalCoordinates
    },
    {
        name: "the-sum-of-its-parts",
        title: "The Sum of Its Parts",
        entry: sumParts
    },
    {
        name: "memory-maneuver",
        title: "Memory Maneuver",
        entry: memoryManeuver
    },
    {
        name: "marble-mania",
        title: "Marble Mania",
        entry: marbleMania
    },
    {
        name: "stars-align",
        title: "The Stars Align",
        entry: starsAlign
    },
    {
        name: "chronal-charge",
        title: "Chronal Charge",
        entry: chronalCharge
    },
    {
        name: "subterranean",
        title: "Subterranean Substainability",
        entry: subterranean
    },
    {
        name: "mine-cart-madness",
        title: "Mine Cart Madness",
        entry: mineCart
    },
    {
        name: "chocolate-charts",
        title: "Chocolate Charts",
        entry: chocolateCharts
    }
];

