import frequency from "./single-entries/frequency";
import inventory from "./single-entries/inventory";
import matter from "./single-entries/no-matter-how-you-slice-it";
import record from "./single-entries/repose-record";
import polymer from "./single-entries/alchemical-reduction";
import Entry from "./entry";

const entryMap: { [key: string]: Entry } = {
    "1": frequency,
    "2": inventory,
    "3": matter,
    "4": record,
    "5": polymer
};

export default entryMap;