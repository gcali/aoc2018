import { entryForFile, simpleOutputCallbackFactory } from "../../entry";
import { modInverse } from "../../../support/algebra";

type Coefficients = {
    a: number,
    b: number,
};

class CoefficientCalculator {

}

export class Deck {
    public positions: Array<bigint>;

    public shouldReverse: boolean = false;

    private readonly size: bigint;

    constructor(
        size: bigint | number,
        positions?: Array<bigint>
    ) {
        this.size = BigInt(size);
        if (positions) {
            this.positions = positions;
        } else {
            this.positions = [...Array(size)].map((e, i) => BigInt(i));
        }
    }

    public deal(): Deck {
        const length = BigInt(this.size);
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i] = length - this.positions[i] - 1n;
        }
        return this;
    }

    public cut(n: number): Deck {
        const length = this.size;
        if (this.shouldReverse) {
            n *= -1;
        }
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i] = (this.positions[i] - BigInt(n) + length) % length;
        }
        return this;
    }

    public increment(n: number): Deck {
        const length = this.size;
        const factor = this.shouldReverse ? modInverse(BigInt(n), length) : BigInt(n);
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i] = (this.positions[i] * factor) % length;
        }
        return this;
    }

    public sort(): Array<{card: (number | bigint), index: (number | bigint)}> {
        return this.positions
            .map((e, i) => ({e, i}))
            .sort((a, b) => Number(a.e - b.e))
            .map((e) => ({card: e.i, index: e.e}));
    }

}

export const shuffleDeck = (lines: string[], deck: Deck): void => {
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
): Promise<number | bigint> => {
    const reversedInput = [...input].reverse();
    const deck = new Deck(size, [BigInt(position)]);
    deck.shouldReverse = true;
    const cache = new Map<bigint, number>();
    const history: Array<bigint> = [];
    for (let i = 0; i < times; i++) {
        if (debug && i > 0 && i % 10000 === 0) {
            await debug(`Iteration ${i / 1000}k`);
        }
        const e = deck.positions[0];
        const hit = cache.get(e);
        if (hit !== undefined) {
            if (hit !== 0) {
                throw new Error("How the hell did this happen?");
            }
            const loopSize = i - hit;
            const remaining = times - i;
            const delta = remaining % loopSize;
            const index = hit + delta;
            return history[index];
        }
        history.push(e);
        cache.set(e, i);
        shuffleDeck(reversedInput, deck);
    }
    return deck.positions[0];
};

export const slamShuffle = entryForFile(
    async ({ lines, outputCallback }) => {
        const size = 10007;
        const deck = new Deck(size, [2019n]);
        shuffleDeck(lines, deck);
        await outputCallback(deck.sort());
    },
    async ({ lines, outputCallback }) => {
        const size = 119315717514047;
        const times = 101741582076661;
        const result = await findNumberAtPosition(lines, size, 2020, times, outputCallback);
        await outputCallback(result);
    },
    { key: "slam-shuffle", title: "Slam Shuffle", stars: 1}
);
