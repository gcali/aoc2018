import { entryForFile } from "../../entry";
import { buildGroups } from '../../../support/sequences';

const limit = "z".charCodeAt(0);
const base = "a".charCodeAt(0);

const increment = (s: string): string => {
    const tokens = s.split("").reverse();
    let carry = 1;
    for (let i = 0; i < tokens.length; i++) {
        let c = tokens[i].charCodeAt(0);
        c = c +  carry;
        carry = 0;
        if (c > limit) {
            c = base + (c - limit - 1);
            carry++;
        }
        tokens[i] = String.fromCharCode(c);
    }
    return tokens.reverse().join("");
};

const testPairs = (s: string): boolean => {
    const pairs = [...buildGroups(s.split(""), 2)];
    const allEqual = pairs
        .map((p, i) => ({p, i}))
        .filter(e => e.p[0] === e.p[1]);
    return allEqual.length >= 2 && (allEqual[allEqual.length - 1].i - allEqual[0].i) >= 2;
};

const testIncreasing = (s: string): boolean => {
    const trios = buildGroups(s.split(""), 3);
    for (const trio of trios) {
        if (trio[2] === increment(trio[1]) && trio[1] === increment(trio[0]) && trio[0].charCodeAt(0) < trio[2].charCodeAt(0)) {
            return true;
        }
    }
    return false;
};

const testPassword = (s: string): boolean => {
    if (s.includes("i") || s.includes("o") || s.includes("l")) {
        return false;
    }
    if (!testPairs(s)) {
        return false;
    }
    return testIncreasing(s);
}

export const corporatePolicy = entryForFile(
    async ({ lines, outputCallback }) => {
        const startPassword = lines[0];
        let password = startPassword;
        do {
            password = increment(password);
            if (password === startPassword) {
                throw new Error("Finished domain, no result");
            }
        } while (!testPassword(password));

        await outputCallback(password);
    },
    async ({ lines, outputCallback }) => {
        const startPassword = lines[0];
        let password = startPassword;
        for (let i = 0; i < 2; i++) {
            do {
                password = increment(password);
                if (password === startPassword) {
                    throw new Error("Finished domain, no result");
                }
            } while (!testPassword(password));
        }

        await outputCallback(password);
    },
    { key: "corporate-policy", title: "Corporate Policy", stars: 2}
);