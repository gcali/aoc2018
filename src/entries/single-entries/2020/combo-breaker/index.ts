import { entryForFile } from "../../../entry";

const constants = {
    subjectNumber: 7n,
    mod: 20201227n,
};

const hack = (publicKey: number): number => {
    let loopSize = 0;
    const subjectNumber = constants.subjectNumber;
    const mod = constants.mod;
    let current = 1n;
    const target = BigInt(publicKey);
    while (current !== target) {
        current *= subjectNumber;
        current %= mod;
        loopSize++;
    }
    return loopSize;
};

const calculate = (subjectNumber: number, loopSize: number): number => {
    const mod = constants.mod;
    let current = 1n;
    const bigSubject = BigInt(subjectNumber);
    while (loopSize -- > 0) {
        current *= bigSubject;
        current %= mod;
    }
    return Number(current);
};

export const comboBreaker = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const [card, door] = lines.map((l) => parseInt(l, 10));
        const doorLoopSize = hack(door);
        const encryptionKey = calculate(card, doorLoopSize);
        await resultOutputCallback(encryptionKey);

    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        throw Error("Not implemented");
    },
    {
        key: "combo-breaker",
        title: "Combo Breaker",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);
