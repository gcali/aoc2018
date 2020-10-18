import Best, { CustomBest, minNumber } from "../../../support/best";
import { entryForFile } from "../../entry";

export const signalsAndNoise = entryForFile(
    async ({ lines, outputCallback }) => {
        const result: string[] = [];
        for (let i = 0; i < lines[0].length; i++) {
            const frequency = new Map<string, number>();
            lines.forEach((line) => {
                frequency.set(line[i], (frequency.get(line[i]) || 0) + 1);
            });
            const comparator = new Best<string>();
            for (const entry of frequency) {
                comparator.add({key: entry[1], value: entry[0]});
            }
            result.push(comparator.currentBest!.value);
        }
        await outputCallback(result.join(""));
    },
    async ({ lines, outputCallback }) => {
        const result: string[] = [];
        for (let i = 0; i < lines[0].length; i++) {
            const frequency = new Map<string, number>();
            lines.forEach((line) => {
                frequency.set(line[i], (frequency.get(line[i]) || 0) + 1);
            });
            const comparator = new CustomBest<number, string>(minNumber);
            for (const entry of frequency) {
                comparator.add({key: entry[1], value: entry[0]});
            }
            result.push(comparator.currentBest!.value);
        }
        await outputCallback(result.join(""));
    },
    { key: "signals-and-noise", title: "Signals and Noise", stars: 2}
);
