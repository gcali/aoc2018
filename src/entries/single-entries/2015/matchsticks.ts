import { entryForFile } from "../../entry";

const countRealLetters = (line: string): number => {
    let isEscaped = false;
    let skip = 0;
    const sliced = line.slice(1, line.length - 1);
    let realCount = 0;
    for (const c of sliced) {
        if (skip > 0) {
            skip--;
        } else if (isEscaped) {
            if(c === "x") {
                skip = 2;
            }
            isEscaped = false;
        } else {
            if (c === "\\") {
                isEscaped = true;
            }
            realCount++;
        }
    }
    return realCount;
};

const countEncoded = (line: string): number => {
    let count = 2;
    for (const c of line) {
        if (c === "\"" || c === "\\") {
            count++;
        }
        count++;
    }
    return count;
}

export const matchsticks = entryForFile(
    async ({ lines, outputCallback }) => {
        const overhead = lines
            .map(line => line.length - countRealLetters(line))
            .reduce((acc, next) => acc + next);
        await outputCallback(overhead);
    },
    async ({ lines, outputCallback }) => {
        const encoded = lines
            .map(line => countEncoded(line) - line.length)
            .reduce((acc, next) => acc + next);
            await outputCallback(encoded);
    },
    { key: "matchsticks", title: "Matchsticks", stars: 2}
);