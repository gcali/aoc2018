import { entryForFile } from "../../entry";

const sayNumber = (s: string): string => {
    const res: string[] = [];
    let i = 0;
    while (i < s.length) {
        const length = findSequenceLength(s, i);
        res.push(`${length}${s[i]}`);
        i += length;
    }
    return res.join("");
};

const findSequenceLength = (s: string, start: number): number => {
    const c = s[start];
    let i: number;
    for (i = start + 1; i < s.length; i++) {
        if (s[i] !== c) {
            break;
        }
    }
    return i - start;
}

export const elvesLookElvesSay = entryForFile(
    async ({ lines, outputCallback }) => {
        const input = lines[0];
        let transformed = input;
        for (let i = 0; i < 40; i++) {
            transformed = sayNumber(transformed);
        }
        await outputCallback(transformed.length);
    },
    async ({ lines, outputCallback }) => {
        const input = lines[0];
        let transformed = input;
        for (let i = 0; i < 50; i++) {
            transformed = sayNumber(transformed);
        }
        await outputCallback(transformed.length);
    },
    { key: "elves-look-elves-say", title: "Elves Look, Elves Say", stars: 2}
);