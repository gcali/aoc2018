import { entryForFile } from "../../entry";

const parseLines = (lines: string[]): Array<[number, number, number]> => {
    return lines.map(
        (line) =>
            line
                .trim()
                .split(" ")
                .filter((e) => e.length > 0)
                .map((e) => parseInt(e, 10)) as [number, number, number]
    );
};

type Triple = [number, number, number];

const parseSecondLines = (lines: string[]): Array<[number, number, number]> => {
    const input = parseLines(lines);
    let current: number[][] = [[], [], []];
    const result: Array<[number, number, number]> = [];
    let started = false;
    for (let i = 0; i < lines.length; i++) {
        if (i % 3 === 0 && started) {
            result.push(current[0] as Triple, current[1] as Triple, current[2] as Triple);
            current = [[], [], []];
        }
        started = true;
        for (let x = 0; x < 3; x++) {
            current[x].push(input[i][x]);
        }
    }
    result.push(current[0] as Triple, current[1] as Triple, current[2] as Triple);
    return result;

};

export const squaresWithThreeSides = entryForFile(
    async ({ lines, outputCallback }) => {
        const input = parseLines(lines);

        let count = 0;

        for (const line of input) {
            let isValid = true;
            for (let i = 0; i < 3; i++) {
                let s = 0;
                for (let x = 0; x < 3; x++) {
                    if (x !== i) {
                        s += line[x];
                    }
                }
                if (s <= line[i]) {
                    isValid = false;
                }
            }
            if (isValid) {
                count++;
            }
        }

        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        const input = parseSecondLines(lines);

        let count = 0;

        for (const line of input) {
            let isValid = true;
            for (let i = 0; i < 3; i++) {
                let s = 0;
                for (let x = 0; x < 3; x++) {
                    if (x !== i) {
                        s += line[x];
                    }
                }
                if (s <= line[i]) {
                    isValid = false;
                }
            }
            if (isValid) {
                count++;
            }
        }

        await outputCallback(count);
    },
    { key: "squares-with-three-sides", title: "Squares With Three Sides", stars: 2}
);
