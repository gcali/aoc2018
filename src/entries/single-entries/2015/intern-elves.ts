import { entryForFile } from "../../entry";

const calculateHasDuplicates = (s: string): boolean => {
    for (let i = 1; i < s.length; i++) {
        if (s[i] === s[i - 1]) {
            return true;
        }
    }
    return false;
};

const buildGroups = (s: string, size: number): string[] => {
    const res: string[] = [];
    for (let i = 0; i <= s.length - size; i++) {
        res.push(s.slice(i, i + size));
    }
    return res;
};
const isNice = (s: string): boolean => {
    const vowels = ["a", "e", "i", "o", "u"];
    const howManyVowels = s.split("").filter((c) => vowels.indexOf(c) >= 0).length;
    const hasDuplicates = calculateHasDuplicates(s);
    const hasForbidden = ["ab", "cd", "pq", "xy"].filter((e) => s.indexOf(e) >= 0).length > 0;

    const conditions = [(howManyVowels >= 3), hasDuplicates, !hasForbidden];
    return conditions.reduce((acc, next) => acc && next);
};

const hasNicePairs = (s: string): boolean => {
    const pairs = buildGroups(s, 2);
    for (let i = 0; i < pairs.length; i++) {
        if (pairs.lastIndexOf(pairs[i]) > i + 1) {
            return true;
        }
    }
    return false;
};

const hasNiceTrios = (s: string): boolean => {
    const trios = buildGroups(s, 3);
    for (const trio of trios) {
        if (trio[0] === trio[2]) {
            return true;
        }
    }
    return false;
};

export const internElves = entryForFile(
    async ({ lines, outputCallback }) => {
        const niceLines = lines.filter(isNice);
        await outputCallback(niceLines.length);
    },
    async ({ lines, outputCallback }) => {
        const niceLines = lines.filter((line) => hasNicePairs(line) && hasNiceTrios(line));
        await outputCallback(niceLines.length);
    },
    {
        key: "intern-elves",
        title: "Doesn't He Have Intern-Elves For This?",
        stars: 2
    }
);
