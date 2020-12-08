import { DefaultListDictionaryString, Queue } from "../../../../support/data-structure";
import { entryForFile } from "../../../entry";

interface BagRule {
    color: string;
    contains?: Array<{quantity: number; color: string}>;
}

const parseContainingBags = (line: string): Array<{quantity: number; color: string}> => {
    const startFrom = line.indexOf("contain") + "contain".length;
    line = line.slice(startFrom).trim();
    const bags = line
        .replace(".", "")
        .split(", ")
        .map((l) => l.split(" "))
        .map((l) => {
            const quantity = parseInt(l[0], 10);
            const color = l.slice(1, 3).join(" ");
            return {
                quantity,
                color
            };
        });
    return bags;
};

const parseLines = (lines: string[]): BagRule[] => {
    return lines.map((line) => {
        const splitIndex = line.indexOf("bags");
        const mainColor = line.slice(0, splitIndex).trim();
        const isEmpty = line.indexOf("contain no") >= 0;
        return {
            color: mainColor,
            contains: isEmpty ? undefined : parseContainingBags(line)
        };
    });
};

const toString = (bagRules: BagRule[]): string => {
    return bagRules
        .map((b) => `${b.color} bags contain ${b.contains ?
            b.contains.map((e) => `${e.quantity} ${e.color} bag${e.quantity > 1 ? "s" : ""}`).join(",")
            : "no other bags"}.`)
        .join("\n");
};

export const handyHaversacks = entryForFile(
    async ({ lines, resultOutputCallback: resultOutputcallback }) => {
        const reverseRules = new DefaultListDictionaryString<string>();
        const rules = parseLines(lines);
        for (const rule of rules) {
            if (rule.contains) {
                for (const target of rule.contains) {
                    reverseRules.add(target.color, rule.color);
                }
            }
        }
        const results: Set<string> = new Set<string>();
        const mainTarget = "shiny gold";
        const toExplore = new Queue<string>();
        toExplore.add(mainTarget);
        while (!toExplore.isEmpty) {
            const newCandidates = reverseRules.get(toExplore.get()!);
            for (const candidate of newCandidates) {
                if (!results.has(candidate)) {
                    if (candidate === mainTarget) {
                        throw new Error("Unexpected");
                    }
                    results.add(candidate);
                    toExplore.add(candidate);
                }
            }
        }

        await resultOutputcallback(results.size);
    },
    async ({ lines, resultOutputCallback }) => {
        const rules = parseLines(lines);
        const directRules: {[key: string]: Array<{quantity: number; color: string}>} = {};
        for (const rule of rules) {
            directRules[rule.color] = rule.contains || [];
        }
        const result: Array<{quantity: number; color: string}> = [];
        const toExplore = new Queue<{quantity: number; color: string}>();
        toExplore.add({quantity: 1, color: "shiny gold"});
        while (true) {
            const current = toExplore.get();
            if (!current) {
                break;
            }
            const hasToHave = directRules[current.color];
            for (const nested of hasToHave) {
                const nestedQuantity = nested.quantity * current.quantity;
                result.push({quantity: nestedQuantity, color: nested.color});
                toExplore.add({quantity: nestedQuantity, color: nested.color});
            }
        }

        const output = result.reduce((acc, next) => acc + next.quantity, 0);
        await resultOutputCallback(output);
    },
    { 
        key: "handy-haversacks", 
        title: "Handy Haversacks", 
        stars: 2,
        supportsQuickRunning: true
    }
);
