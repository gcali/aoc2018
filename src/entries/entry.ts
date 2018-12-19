import frequency from "./frequency";
import inventory from "./inventory";

export interface Entry {
    first: () => void,
    second: () => void
};

const entryMap: { [key: string]: Entry } = {
    "1": frequency,
    "2": inventory
};

export default entryMap;