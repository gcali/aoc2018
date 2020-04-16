import { entryForFile } from "../../entry";
import { modInverse } from "../../../support/algebra";
import { serializeTime } from "../../../support/time";

export class Deck {
    public positions: number[];

    public shouldReverse: boolean = false;

    constructor(
        private readonly size: number,
        positions?: number[]
    ) {
        if (positions) {
            this.positions = positions;
        } else {
            this.positions = [...Array(size)].map((e, i) => i);
        }
    }

    public deal(): Deck {
        const length = this.size;
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i] = length - this.positions[i] - 1;
        }
        return this;
    }

    public cut(n: number): Deck {
        const length = this.size;
        if (this.shouldReverse) {
            n *= -1;
        }
        if (n > 0) {
            return this.internalCut(n);
        } else {
            return this.internalCut(length + n);
        }
    }

    public increment(n: number): Deck {
        const length = this.size;
        const factor = this.shouldReverse ? modInverse(n, length) : n;
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i] = (this.positions[i] * factor) % length;
        }
        return this;
    }

    public sort(): Array<{card: number, index: number}> {
        return this.positions.map((e, i) => ({e, i})).sort((a, b) => a.e - b.e).map((e) => ({card: e.i, index: e.e}));
    }

    private internalCut(n: number): Deck {
        if (n < 0) {
            throw new Error("Expected a positive number");
        }
        const length = this.size;
        for (let i = 0; i < this.positions.length; i++) {
            const oldPosition = this.positions[i];
            if (oldPosition < n) {
                this.positions[i] = length - n + oldPosition;
            } else {
                this.positions[i] = oldPosition - n;
            }
        }
        return this;

    }
}

export const executeInput = (lines: string[], deck: Deck): void => {
    lines.forEach((line) => {
        if (line.indexOf("deal into new stack") >= 0) {
            deck.deal();
        } else {
            const tokens = line.split(" ");
            const n = parseInt(tokens[tokens.length - 1], 10);
            if (line.indexOf("increment") >= 0) {
                deck.increment(n);
            } else if (line.indexOf("cut") >= 0) {
                deck.cut(n);
            } else {
                throw new Error("Could not parse " + line);
            }
        }
    });
};

export const findNumberAtPosition = async (
    input: string[],
    size: number,
    position: number,
    times: number,
    debug?: (s: string) => Promise<void>
): Promise<number> => {
    const reversedInput = [...input]; // .reverse();
    const deck = new Deck(size, [position]);
    deck.shouldReverse = true;
    const cache = new Map<number, number>();
    const history: number[] = [];
    for (let i = 0; i < times; i++) {
        if (debug && i > 0 && i % 10000 === 0) {
            await debug(`Iteration ${i / 1000}k`);
        }
        const e = deck.positions[0];
        const hit = cache.get(e);
        if (hit !== undefined) {
            const loopSize = i - hit;
            const remaining = times - i;
            const delta = remaining % loopSize;
            const index = hit + delta;
            return history[index];
        }
        history.push(e);
        cache.set(e, i);
        executeInput(reversedInput, deck);
    }
    return deck.positions[0];
};

export const slamShuffle = entryForFile(
    async ({ lines, outputCallback }) => {
        const size = 10007;
        const deck = new Deck(size, [2019]);
        executeInput(lines, deck);
        await outputCallback(deck.sort());
    },
    async ({ lines, outputCallback }) => {
        const size = 119315717514047;
        const times = 101741582076661;
        const result = await findNumberAtPosition(lines, size, 2020, times, outputCallback);
        // const size = 10007;
        // const times = 1;
        // const result = await findNumberAtPosition(lines, size, 3074, times, outputCallback);
        await outputCallback(result);
    },
    { key: "slam-shuffle", title: "Slam Shuffle", stars: 1}
);
