import frequency from "./frequency";
import inventory from "./inventory";
import matter from "./no-matter-how-you-slice-it";

export interface Entry {
    first: () => void,
    second: () => void
};

const entryMap: { [key: string]: Entry } = {
    "1": frequency,
    "2": inventory,
    "3": matter
};

export default entryMap;