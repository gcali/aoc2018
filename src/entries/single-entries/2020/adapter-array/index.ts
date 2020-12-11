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
//         lines = [
// "16",
// "10",
// "15",
// "5",
// "1",
// "11",
// "7",
// "19",
// "6",
// "12",
// "4",
//         ]
//         lines = [
// "28",
// "33",
// "18",
// "42",
// "31",
// "14",
// "46",
// "20",
// "48",
// "47",
// "24",
// "23",
// "49",
// "45",
// "19",
// "38",
// "39",
// "11",
// "1",
// "32",
// "25",
// "35",
// "8",
// "17",
// "7",
// "9",
// "4",
// "2",
// "34",
// "10",
// "3",

//         ]
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
    { key: "adapter-array", title: "Adapter Array"}
);
