import { LinkedList } from '../../../../support/data-structure';
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
        const sums = new LinkedList<{min: number, max: number, value: number}>();
        for (const n of ns) {
            for (const sum of sums) {
                sum.element.value += n;
                sum.element.min = Math.min(n, sum.element.min);
                sum.element.max = Math.max(n, sum.element.max);
                if (sum.element.value === invalid) {
                    await resultOutputCallback(sum.element.min + sum.element.max);
                    return;
                } else if (sum.element.value > invalid) {
                    sum.remove();
                }
            }
            sums.addNode({min: n, max: n, value: n});
        }
        await resultOutputCallback("Could not find it");
    },
    { key: "encoding-error", title: "Encoding Error", stars: 2, supportsQuickRunning: true}
);
