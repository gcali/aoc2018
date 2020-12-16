import { entryForFile } from "../../../entry";

const parseLines = (lines: string[]): number[] => {
    return lines[0].split(",").map((e) => parseInt(e, 10));
};

export const rambunctiousRecitation = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        // lines[0] = "0,3,6";
        const startList = parseLines(lines);
        const memory: {[key: number]: number} = {};
        let lastSpoken: number = 0;
        let lastAge: number | undefined;
        for (let i = 0; i < startList.length; i++) {
            memory[startList[i]] = i + 1;
            lastSpoken = startList[i];
        }
        for (let i = startList.length + 1; i <= 2020; i++) {
            const newSpoken = lastAge !== undefined ? (memory[lastSpoken] - lastAge) : 0;
            lastAge = memory[newSpoken];
            if (i <= 10) {
                await outputCallback(newSpoken);
            }
            memory[newSpoken] = i;
            lastSpoken = newSpoken;
        }
        await resultOutputCallback(lastSpoken);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const startList = parseLines(lines);
        const memory: {[key: number]: number} = {};
        let lastSpoken: number = 0;
        let lastAge: number | undefined;
        for (let i = 0; i < startList.length; i++) {
            memory[startList[i]] = i + 1;
            lastSpoken = startList[i];
        }
        for (let i = startList.length + 1; i <= 30000000; i++) {
            const newSpoken = lastAge !== undefined ? (memory[lastSpoken] - lastAge) : 0;
            lastAge = memory[newSpoken];
            if (i % 10000 === 0) {
                await outputCallback(`${i / 30000000 * 100}%`, true);
            }
            memory[newSpoken] = i;
            lastSpoken = newSpoken;
        }
        await resultOutputCallback(lastSpoken);
    },
    {
        key: "rambunctious-recitation",
        title: "Rambunctious Recitation",
        embeddedData: true,
        stars: 2,
        supportsQuickRunning: true
    }
);
