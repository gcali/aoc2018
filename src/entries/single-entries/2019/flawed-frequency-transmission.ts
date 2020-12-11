import { entryForFile } from "../../entry";
import { List } from "linq-typescript";
import wu from "wu";
import { serializeTime } from "../../../support/time";

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

    public delta: number = 1;
    constructor(private localBasePattern: number[]) {

    }

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
        const repeatedInput = Array.from({ length: 10000 }, () => input).flat();
        const interestingDigits = parseInt(input.slice(0, 7).join(""), 10);
        let iterationTime: number | null = null;
        for (let iteration = 0; iteration < 100; iteration++) {
            const startIterationTime = new Date().getTime();
            for (let d = repeatedInput.length - 1; d >= interestingDigits; d--) {
                let s = repeatedInput[d];
                if (d + 1 < repeatedInput.length) {
                    s += repeatedInput[d + 1];
                }
                repeatedInput[d] = s;
            }
            for (let d = interestingDigits; d < repeatedInput.length; d++) {
                repeatedInput[d] = Math.abs(repeatedInput[d]) % 10;
            }
            iterationTime = new Date().getTime() - startIterationTime;
            await outputCallback("Done iteration " + iteration);
        }
        await outputCallback(repeatedInput.slice(interestingDigits, interestingDigits + 8).join(""));
    },
    { key: "flawed-frequency-transmission", title: "Flawed Frequency Transmission", stars: 2, embeddedData: true}
);
