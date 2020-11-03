import { entryForFile } from "../../entry";

type Elf = {
    index: number;
    presents: number;
}

const integerLogarithm = (x: number, base: number): {value: number, isLower: boolean} => {
    let result: number = 0;
    let current = 1;
    while (current < x) {
        current *= base;
        result++;
    }
    if (current === x) {
        return {value: result, isLower: false};
    }
    return {value: result -1, isLower: true};
}

export const anElephantNamedJoseph = entryForFile(
    async ({ lines, outputCallback }) => {
        const howManyElves = parseInt(lines[0], 10);
        let elves: Elf[] = [];
        for (let i = 0; i < howManyElves; i++) {
            elves.push({
                index: i+1,
                presents: 1
            });
        }
        while (true) {
            for (let i = 0; i < elves.length; i++) {
                if (elves[i].presents === 0) {
                    continue;
                }
                const stealFrom = (i+1)%elves.length;
                elves[i].presents += elves[stealFrom].presents;
                elves[stealFrom].presents = 0;
            }
            elves = elves.filter(e => e.presents > 0);
            if (elves.length === 1) {
                await outputCallback("Found it!");
                await outputCallback(elves[0].index);
                return;
            }
        }
    },
    async ({ lines, outputCallback }) => {
        const calculator = (howManyElves: number) => {
            const logarithm = integerLogarithm(howManyElves, 3);
            if ([81,27,3].includes(howManyElves)) {
                console.log(logarithm);
            }
            if (!logarithm.isLower) {
                return howManyElves;
            }
            const delta = 3 ** logarithm.value;
            if (howManyElves <= delta * 2) {
                return howManyElves - delta;
            } else {
                return 2*howManyElves - 3*delta;
            }

        }
        await outputCallback("Starting pattern calculations...");
        for (let howManyElves = 1; howManyElves < 100; howManyElves++) {
            let elves: Elf[] = [];
            for (let i = 0; i < howManyElves; i++) {
                elves.push({
                    index: i+1,
                    presents: 1
                });
            }
            let nextIndex = 0;
            let lastSteal: null | number = null;
            while (elves.length > 1) {
                if (elves.length % 10000 === 0) {
                    await outputCallback(elves.length);
                }
                nextIndex = nextIndex % elves.length;
                const stealFrom = (nextIndex + Math.floor(elves.length / 2)) % elves.length;
                if (lastSteal !== null) {
                    if (elves.length % 2 === 0) {
                        if (stealFrom !== lastSteal + 2) {
                            throw new Error(":(");
                        }
                    } else {
                        if (stealFrom !== lastSteal + 1) {
                            throw new Error(":((");
                        }
                    }
                }
                elves[nextIndex].presents += elves[stealFrom].presents;
                elves.splice(stealFrom, 1);
                if (nextIndex < stealFrom) {
                    nextIndex++;
                }
            }
            await outputCallback(`${howManyElves}:${elves[0].index}:${calculator(howManyElves)}`);
        }
        await outputCallback("Final calculation:")
        const howManyElves = parseInt(lines[0], 10);
        await outputCallback(calculator(howManyElves));
    },
    { key: "an-elephant-named-joseph", title: "An Elephant Named Joseph", stars: 2}
);