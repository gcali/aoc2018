import { entryForFile } from "../../entry";

const countNumbers = (parsed: any, skipReds: boolean = false): number => {
    if (typeof(parsed) === "number") {
        return parsed as number;
    } else if (typeof(parsed) === "string") {
        return 0;
    } else if (Array.isArray(parsed)) {
        const array = parsed as any[];
        return array.reduce((acc, next) => acc + countNumbers(next, skipReds), 0);
    } else {
        const keys = Object.keys(parsed);
        if (skipReds) {
            if (Object.values(parsed).includes("red")) {
                return 0;
            }
        }
        return keys.reduce((acc, next) => acc + countNumbers(parsed[next], skipReds), 0);
    }
};

export const abacusFramework = entryForFile(
    async ({ lines, outputCallback }) => {
        const parsed = JSON.parse(lines[0]);
        const numbers = countNumbers(parsed);
        await outputCallback(numbers);
    },
    async ({ lines, outputCallback }) => {
        const parsed = JSON.parse(lines[0]);
        const numbers = countNumbers(parsed, true);
        await outputCallback(numbers);
    },
    { key: "abacus-framework", title: "JSAbacusFramework.io", stars: 2}
);