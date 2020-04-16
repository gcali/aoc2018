import { entryForFile } from "../../entry";

function parseLines(lines: string[]): number[][] {
    return lines
        .map((l) => l.trim())
        .map((line) => line.split("\t").map((token) => parseInt(token, 10)))
    ;
}

export const corruptionChecksum = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const sequence = parseLines(lines);
        const checksum = sequence.map((row) => {
            const max = row.reduce((acc, next) => Math.max(acc, next));
            const min = row.reduce((acc, next) => Math.min(acc, next));
            return max - min;
        }).reduce((acc, next) => acc + next);
        await outputCallback(checksum);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const sequence = parseLines(lines);
        const checksum = sequence.map((row) => {
            const internalChecksum = row.map((small) => {
                const candidates = row.filter((big) => big > small && big % small === 0);
                if (candidates.length === 0) {
                    return null;
                } else if (candidates.length !== 1) {
                    throw new Error("Multiple candidates found for " + small + ": " + JSON.stringify(candidates));
                }
                return candidates[0] / small;
            }).filter((e) => e !== null).map((e) => e!);
            if (internalChecksum.length !== 1) {
                throw new Error("Multiple candidates found for internal: " + JSON.stringify(internalChecksum));
            }
            return internalChecksum[0];
        }).reduce((acc, next) => acc + next);
        await outputCallback(checksum);

    },
    { key: "corruption-checksum", title: "Corruption Checksum", stars: 2, }
);

