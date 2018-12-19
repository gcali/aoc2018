import frequency from "./frequency";

interface Entry {
    (): void;
};

let entryMap: { [key: string]: Entry } = {
    "1": frequency
};

export default entryMap;