import { entryForFile } from "../../../entry";

const findInvalid = (ns: number[]): number | null => {
    for (let i = 25; i < ns.length; i++) {
        const target = ns[i];
        const lookingFor = new Set<number>();
        let found = false;
        for (let j = i - 25; j < i; j++) {
            if (lookingFor.has(ns[j])) {
                found = true;
                break;
            } else {
                lookingFor.add(target - ns[j]);
            }
        }
        if (!found) {
            return target;
        }
    }
    return null;
};

export const encodingError = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const ns = lines.map((l) => parseInt(l, 10));
        const invalid = findInvalid(ns);
        await resultOutputCallback(ns === null ? "Did not find it :(" : invalid);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const ns = lines.map((l) => parseInt(l, 10));
        const invalid = findInvalid(ns);
        if (invalid === null) {
            throw new Error("Could not find invalid");
        }
        let sums: Array<{min: number, max: number, value: number}> = [];
        for (const n of ns) {
            sums.forEach((s) => {
                s.value += n;
                s.min = Math.min(n, s.min);
                s.max = Math.max(n, s.max);
            });
            sums = sums.filter((s) => s.value <= invalid);
            const matching = sums.find((s) => s.value === invalid);
            if (matching) {
                await resultOutputCallback(matching.min + matching.max);
                return;
            }
            sums.push({min: n, max: n, value: n});
        }
        await resultOutputCallback("Could not find it");
    },
    { key: "encoding-error", title: "Encoding Error", stars: 2, supportsQuickRunning: true}
);
