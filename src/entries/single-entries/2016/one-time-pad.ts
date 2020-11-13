import { Md5 } from "ts-md5";
import { entryForFile } from "../../entry";

type Hash = (n: number) => string;

const baseHashGenerator = (salt: string): Hash => {
    return (n: number) => {
        return Md5.hashAsciiStr(salt + n) as string;
    };
};

const stretchHashGenerator = (salt: string): Hash => {
    return (n: number) => {
        let current: string = Md5.hashAsciiStr(salt + n) as string;
        for (let i = 0; i < 2016; i++) {
            current = Md5.hashAsciiStr(current) as string;
        }
        return current;
    };
};

const incrementHashes = (hash: Hash, current: string[], howManyToAdd: number) => {
    let nextIndex = current.length;
    const newLength = current.length + howManyToAdd;
    while (nextIndex < newLength) {
        const v = hash(nextIndex);
        current.push(v);
        nextIndex++;
    }
    console.log("New length: " + newLength);
};

const findTriplet = (s: string): number | null => {
    const tokens = s.split("");
    for (let i = 0; i < tokens.length - 2; i++) {
        if (tokens[i] === tokens[i + 1] && tokens[i + 1] === tokens[i + 2]) {
            return i;
        }
    }
    return null;
};

const hasQuintuplet = (s: string, c: string): boolean => {
    const rawTarget: string[] = [];
    for (let i = 0; i < 5; i++) {
        rawTarget.push(c);
    }
    const target = rawTarget.join("");
    return s.includes(target);
};

const isValid = (s: string, hashes: string[], hash: Hash, index: number): boolean => {
    const triplet = findTriplet(s);
    if (triplet === null) {
        return false;
    }
    const targetIndex = index + 1000;
    while (targetIndex >= hashes.length) {
        incrementHashes(hash, hashes, 2000);
    }
    for (let i = index + 1; i <= targetIndex; i++) {
        if (hasQuintuplet(hashes[i], s[triplet])) {
            return true;
        }
    }
    return false;
};

export const oneTimePad = entryForFile(
    async ({ lines, outputCallback }) => {
        const hashCalculator = baseHashGenerator(lines[0]);
        let howMany = 64;
        const hashes: string[] = [];
        const keys: Array<[string, number]> = [];
        let currentIndex = 0;
        while (howMany > 0) {
            if (currentIndex >= hashes.length) {
                incrementHashes(hashCalculator, hashes, 2000);
            }
            if (isValid(hashes[currentIndex], hashes, hashCalculator, currentIndex)) {
                keys.push([hashes[currentIndex], currentIndex]);
                howMany--;
            }
            currentIndex++;
        }
        await outputCallback(keys[keys.length - 1][1]);
    },
    async ({ lines, outputCallback }) => {
        const hashCalculator = stretchHashGenerator(lines[0]);
        let howMany = 64;
        const hashes: string[] = [];
        const keys: Array<[string, number]> = [];
        let currentIndex = 0;
        while (howMany > 0) {
            if (currentIndex >= hashes.length) {
                incrementHashes(hashCalculator, hashes, 2000);
            }
            if (isValid(hashes[currentIndex], hashes, hashCalculator, currentIndex)) {
                keys.push([hashes[currentIndex], currentIndex]);
                howMany--;
            }
            currentIndex++;
        }
        await outputCallback(keys[keys.length - 1][1]);
    },
    { key: "one-time-pad", title: "One-Time Pad", stars: 2}
);
