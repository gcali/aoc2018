import frequency from "./frequency";

interface Entry {
    first: () => void,
    second: () => void
};

let entryMap: { [key: string]: Entry } = {
    "1": frequency
};

export default entryMap;