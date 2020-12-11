import { groupBy } from "../../../../support/sequences";
import { entryForFile } from "../../../entry";

const prettyPrint = (lines: string[]) =>
        [...groupBy(lines.map((l) => parseInt(l, 10)).concat([0, 51]).sort((a, b) => a - b), 10)]
            .map((e) => e.map((x) => x.toString().padStart(3, " ")).join(" ")).join("\n");

export const adapterArray = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const ns = lines
            .map((l) => parseInt(l, 10))
            .sort((a, b) => a - b)
            .reduce((acc, next) => {
                acc.differences[next - acc.prev] = (acc.differences[next - acc.prev] || 0) + 1;
                acc.prev = next;
                return acc;
            }, {
                prev: 0,
                differences: {} as {[key: number]: number}
            });
        ns.differences[3]++;
        await outputCallback(ns.differences);
        await resultOutputCallback(ns.differences[1] * ns.differences[3]);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const ns = lines
            .map((l) => parseInt(l, 10))
            .sort((a, b) => a - b)
            .reduce((acc, next) => (
                {
                prev: next,
                vs: [...acc.vs, next - acc.prev]
            }
            ), {prev: 0, vs: [] as number[]});
        ns.vs.push(3);

        const factors: number[] = [];
        let isOnStreak = false;
        let count = 0;
        for (const n of ns.vs) {
            if (n === 1) {
                count++;
                isOnStreak = true;
            } else {
                if (isOnStreak && count > 0) {
                    factors.push(count - 1);
                }
                count = 0;
                isOnStreak = false;
            }
        }

        await outputCallback(prettyPrint(lines));
        await outputCallback("");

        await outputCallback(factors);
        await resultOutputCallback(
            factors
                .filter((f) => f > 0)
                .reduce((acc, next) => acc * (
                    next <= 2 ?
                        (2 ** next)  // if there are at most 2 optional adapters, all subsets are fine
                        : 7 // if there are 3, not all are fine; in particular, the empty subset does not work
                ), 1));
    },
    { key: "adapter-array", title: "Adapter Array", stars: 2, embeddedData: true, supportsQuickRunning: true}
);
