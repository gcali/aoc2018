import { entryForFile } from "../../entry";

class Generator {
    constructor(
        private readonly seed: number,
        private readonly factor: number,
        private readonly filter?: (e: number) => boolean
    ) {
        this.last = seed;
    }
    private last: number;

    public getNext(): number {
        do {
            this.last = (this.last * this.factor) % 2147483647;
        } while (this.filter && !this.filter(this.last));

        return this.last;
    }
}

function parseLines(lines: string[]): [number, number] {
    const [a,b] = lines.map(line => line.trim()).filter(line => line).map(line => line.split(" ")[4]).map(e => parseInt(e, 10));
    return [a,b];
}

export const duelingGenerators = entryForFile(
    async ({ lines, outputCallback }) => {
        const [seedA,seedB] = parseLines(lines);
        const factorA = 16807;
        const factorB = 48271;
        const generators = [
            new Generator(seedA, factorA),
            new Generator(seedB, factorB)
        ];
        let count = 0;

        const total = 40 * (10**6);

        for (let i = 0; i < total; i++) {
            if (i % 100000 === 0) {
                await outputCallback(`${i / total * 100}% done`);
            }
            const values = generators.map(generator => generator.getNext());
            const mapped = values.map(value => [...value.toString(2)].reverse().slice(0, 16).join(""));
            const same = mapped.reduce((acc, next) => acc === next ? acc : "");
            if (same !== "") {
                count++;
            } 
        }
        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        const [seedA,seedB] = parseLines(lines);
        const factorA = 16807;
        const factorB = 48271;
        const generators = [
            new Generator(seedA, factorA, e => e % 4 === 0),
            new Generator(seedB, factorB, e => e % 8 === 0)
        ];
        let count = 0;

        const total = 5 * (10**6);

        for (let i = 0; i < total; i++) {
            if (i % 100000 === 0) {
                await outputCallback(`${i / total * 100}% done`);
            }
            const values = generators.map(generator => generator.getNext());
            const mapped = values.map(value => [...value.toString(2)].reverse().slice(0, 16).join(""));
            const same = mapped.reduce((acc, next) => acc === next ? acc : "");
            if (same !== "") {
                count++;
            } 
        }
        await outputCallback(count);
    }
);