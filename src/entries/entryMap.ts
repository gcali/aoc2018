import Entry from "./entry";

import frequency from "./single-entries/frequency";
import inventory from "./single-entries/inventory";
import matter from "./single-entries/no-matter-how-you-slice-it";
import record from "./single-entries/repose-record";
import polymer from "./single-entries/alchemical-reduction";
import chronal from "./single-entries/chronal-coordinates";
import sum from "./single-entries/the-sum-of-its-parts";

const entryMap: { [key: string]: Entry } = {
    "1": frequency,
    "2": inventory,
    "3": matter,
    "4": record,
    "5": polymer,
    "6": chronal,
    "7": sum
};

export default entryMap;