import { entryForFile } from "../../../entry";
const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const result = new Set<T>();
    for (const e of a) {
        if (b.has(e)) {
            result.add(e);
        }
    }
    return result;
};

const buildAnswers = (line: string, set?: Set<string> | undefined): Set<string> => {
    if (set === undefined) {
        set = new Set<string>();
    }
    line.split("").forEach((l) => set!.add(l));
    return set;
};

export const customCustoms = entryForFile(
    async ({ lines, outputCallback }) => {
        let count = 0;
        let currentSet = new Set<string>();
        for (const line of lines) {
            if (!line) {
                count += currentSet.size;
                currentSet = new Set<string>();
            } else {
                buildAnswers(line, currentSet);
            }
        }
        count += currentSet.size;
        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        let count = 0;
        let isFirst = true;
        let currentSet = new Set<string>();
        for (const line of lines) {
            if (!line) {
                count += currentSet.size;
                currentSet = new Set<string>();
                isFirst = true;
            } else {
                if (isFirst) {
                    isFirst = false;
                    buildAnswers(line, currentSet);
                } else {
                    const currentAnswers = buildAnswers(line);
                    currentSet = intersect(currentSet, currentAnswers);
                }
            }
        }
        count += currentSet.size;
        await outputCallback(count);
    },
    { key: "custom-customs", title: "Custom Customs", stars: 2}
);
