import { entryForFile } from "../../entry";
import { List } from "linq-typescript";
import wu from 'wu';

const basePattern = [0, 1, 0, -1];

export function applyPattern(elements: number[], pattern: Pattern) {
    return elements.map((_, position) =>
        Math.abs(
            elements
                .map((element, index) => ({ element, index }))
                .reduce((acc, next) => (acc + next.element * pattern.get(next.index, position)), 0)
            % 10)
    );
}

export async function applyPatternIteratively(
    elements: number[],
    pattern: Pattern,
    howManyTimes: number,
    debug?: (n: number) => Promise<void>
) {
    let current = 0;
    while (current++ < howManyTimes) {
        elements = applyPattern(elements, pattern);
        if (debug) {
            await debug(current);
        }
    }
    return elements;
}

export class Pattern {

    public get length() {
        return this.localBasePattern.length;
    }

    public static default(): Pattern {
        return new Pattern(basePattern);
    }
    constructor(private localBasePattern: number[]) {

    }

    public delta: number = 1;

    public get(index: number, position: number): number {
        const factor = position + 1;
        const realIndex = Math.floor((index + this.delta) / factor);
        return this.localBasePattern[realIndex % basePattern.length];
    }
}

function parseLines(lines: string[]): number[] {
    return lines[0].split("").map((l) => parseInt(l, 10));
}



export const flawedFrequencyTransmission = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const input = parseLines(lines);
        const result = await applyPatternIteratively(input, Pattern.default(), 100);
        await outputCallback(new List(result).take(8).toArray().join(""));
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const input = parseLines(lines);
        let repeatedInput = Array.from({ length: 10000 }, () => input).flat();
        const interestingDigits = parseInt(wu(input).take(7).toArray().join(""), 10);
        const pattern = Pattern.default();
        pattern.delta = 1  + interestingDigits;
        repeatedInput = wu(repeatedInput).drop(interestingDigits).toArray();
        const result = await applyPatternIteratively(
            repeatedInput,
            pattern,
            100,
            async (n) => await outputCallback("Iteration " + n + " done")
        );
        // await outputCallback(new List(result).skip(parseInt(input.join(""), 10)).take(8).toArray().join(""));
        await outputCallback(wu(result).take(8).toArray());
    }
);
