import { oldEntryForFile } from "../entry";

export const entry = oldEntryForFile(
    async (lines, outputCallback) => {
        let currentFrequency = 0;
        lines.forEach((line) => {
            const trimmed = line.trim();
            let value = parseInt(trimmed.slice(1), 10);
            if (trimmed.startsWith("-")) {
                value *= -1;
            }
            currentFrequency += value;
        });
        outputCallback("Result: " + currentFrequency);
    },
    async (lines, outputCallback) => {
        const values: number[] = [];
        const firstRoundOfFrequencies: number[] = [];
        let currentFrequency: number = 0;
        lines.forEach((line) => {
            const trimmed = line.trim();
            let value = parseInt(trimmed.slice(1), 10);
            if (trimmed.startsWith("-")) {
                value *= -1;
            }
            values.push(value);
            currentFrequency += value;
            firstRoundOfFrequencies.push(currentFrequency);
        });
        const foundFrequencies = new Set<number>();
        let current = 0;
        foundFrequencies.add(0);
        let found = false;
        while (!found) {
            found = values.some((v) => {
                current += v;
                if (foundFrequencies.has(current)) {
                    outputCallback("Found: " + current);
                    return true;
                } else {
                    foundFrequencies.add(current);
                    return false;
                }
            });
        }
    },
);
