import { entryForFile } from "../../entry";

function parseLines(lines: string[]): number[] {
    return lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .flatMap((l) => l.split(""))
        .filter((e) => e.trim().length > 0)
        .map((n) => parseInt(n, 10));
}

function findMatching(sequence: number[]): number[] {
    let lastDigit: number | null = null;
    return sequence.filter((n) => {
        const previous = lastDigit;
        lastDigit = n;
        return n === previous;
    });
}

export const inverseCaptcha = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const sequence = parseLines(lines);
        const circular = [...sequence, sequence[0]];
        const matchingSequence: number[] = findMatching(circular);
        await outputCallback(matchingSequence.reduce((a, b) => a + b));
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const sequence = parseLines(lines);
        const step = Math.floor(sequence.length / 2);
        const matchingSequence: number[] = sequence
            .filter((n, index) => sequence[(index + step) % sequence.length] === n);
        await outputCallback(matchingSequence.reduce((a, b) => a + b));
    }
);

