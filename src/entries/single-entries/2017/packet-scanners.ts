import { entryForFile } from "../../entry";

type Direction = -1 | 1;

class Scanner {
    constructor(
        public readonly depth: number,
        public readonly range: number,
        public position: number = 0,
        public direction: Direction = 1
        ) {
    }

    public tick() {
        const position = this.position + this.direction;
        if (position < 0 || position >= this.range) {
            this.direction *= -1;
            this.tick();
        } else {
            this.position = position;
        }
    }

    public clone(): Scanner {
        return new Scanner(this.depth, this.range, this.position, this.direction);
    }
}

type Field = Array<Scanner | null>;

const cloneField = (field: Field): Field => {
    return field.map((e) => e ? e.clone() : e);
};

const parseLines = (lines: string[]): Field => {
    const sparseField = lines.map((line) => {
        const [depth, range] = line.split(": ").map((e) => parseInt(e, 10));
        return new Scanner(depth, range);
    });
    const maxDepth = sparseField.map((e) => e.depth).reduce((acc, next) => Math.max(acc, next));
    return [...Array(maxDepth + 1).keys()].map((index) => {
        const scanner = sparseField.filter((e) => e.depth === index)[0];
        if (scanner) {
            return scanner;
        }
        return null;
    });
};

const tickField = (field: Field) => {
    field.filter((e) => e != null).forEach((e) => e!.tick());
};

export const packetScanners = entryForFile(
    async ({ lines, outputCallback }) => {
        const field = parseLines(lines);
        let currentPosition = -1;
        const collisions: Scanner[] = [];
        while (currentPosition < field.length) {
            currentPosition++;
            const currentScanner = field[currentPosition];
            if (currentScanner && currentScanner.position === 0) {
                collisions.push(currentScanner);
            }
            tickField(field);
        }
        const score = collisions.reduce((acc, next) => acc + (next.depth * next.range), 0);
        await outputCallback(score);
    },
    async ({ lines, outputCallback, pause }) => {
        let delay = 0;
        const baseField = parseLines(lines);
        while (true) {
            if (delay % 1000 === 0) {
                await pause();
            }
            const field = cloneField(baseField);
            let currentPosition = -1;
            let hasCollided = false;
            while (currentPosition < field.length) {
                currentPosition++;
                const currentScanner = field[currentPosition];
                if (currentScanner && currentScanner.position === 0) {
                    hasCollided = true;
                    break;
                }
                tickField(field);
            }
            if (!hasCollided) {
                await outputCallback(delay);
                break;
            }
            tickField(baseField);
            hasCollided = false;
            delay++;
        }
    },
    { key: "packet-scanners", title: "Packet Scanners", stars: 2, }
);
