import { entryForFile } from '../entry';

const entry = entryForFile(
    (lines) => {
        let currentFrequency = 0;
        lines.forEach((line) => {
            const trimmed = line.trim();
            let value = parseInt(trimmed.slice(1), 10);
            if (trimmed.startsWith('-')) {
                value *= -1;
            }
            currentFrequency += value;
        });
        console.log('Result: ' + currentFrequency);
    },
    (lines) => {
        const values: number[] = [];
        const firstRoundOfFrequencies: number[] = [];
        let currentFrequency: number = 0;
        lines.forEach((line) => {
            const trimmed = line.trim();
            let value = parseInt(trimmed.slice(1), 10);
            if (trimmed.startsWith('-')) {
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
                    console.log('found: ' + current);
                    return true;
                } else {
                    foundFrequencies.add(current);
                    return false;
                }
            });
        }
    },
);

export default entry;
