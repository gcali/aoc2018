import frequency from "./frequency";
import inventory from "./inventory";
import matter from "./no-matter-how-you-slice-it";
import record from "./repose-record";
import Entry from "./entry";

const entryMap: { [key: string]: Entry } = {
    "1": frequency,
    "2": inventory,
    "3": matter,
    "4": record
};

export default entryMap;