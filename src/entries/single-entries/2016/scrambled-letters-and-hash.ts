import { permutationGenerator } from "../../../support/sequences";
import { entryForFile } from "../../entry";

type Rule = {
    type: "swap-position";
    a: number;
    b: number;
} | {
    type: "swap-letter";
    a: string;
    b: string;
} | {
    type: "rotate";
    direction: "right" | "left";
    steps: number
} | {
    type: "rotate-on";
    direction: "right";
    letter: string;
} | {
    type: "reverse";
    from: number;
    to: number;
} | {
    type: "move";
    from: number;
    to: number;
};

const parseLine = (line: string): Rule => {
    const tokens = line.split(" ");
    switch (tokens[0]) {
        case "swap":
            if (tokens[1] === "position") {
                return {
                    type: "swap-position",
                    a: parseInt(tokens[2], 10),
                    b: parseInt(tokens[5], 10)
                };
            } else if (tokens[1] === "letter") {
                return {
                    type: "swap-letter",
                    a: tokens[2],
                    b: tokens[5]
                };
            } else {
                throw new Error("Invalid position token: " + tokens[1]);
            }
        case "rotate":
            if (tokens[1] === "based") {
                return {
                    type: "rotate-on",
                    direction: "right",
                    letter: tokens[6]
                };
            } else if (tokens[1] === "left" || tokens[1] === "right") {
                return {
                    type: "rotate",
                    direction: tokens[1],
                    steps: parseInt(tokens[2], 10)
                };
            } else {
                throw new Error("Invalid rotate token: " + tokens[1]);
            }
        case "reverse":
            return {
                type: "reverse",
                from: parseInt(tokens[2], 10),
                to: parseInt(tokens[4], 10)
            };
        case "move":
            return {
                type: "move",
                from: parseInt(tokens[2], 10),
                to: parseInt(tokens[5], 10)
            };
        default:
            throw new Error("Invalid token");
    }
};

const applyRule = (input: string, rule: Rule): string => {
    const tokenized = [...input];
    switch (rule.type) {
        case "swap-position":
            return tokenized.map((e, i) => i === rule.a ? input[rule.b] : (i === rule.b ? input[rule.a] : e)).join("");
        case "swap-letter":
            return applyRule(input, {type: "swap-position", a: input.indexOf(rule.a), b: input.indexOf(rule.b)});
        case "rotate":
            const rotate = (rindex: number) => {
                const steps = (rule.direction === "right" ? -rule.steps : rule.steps);
                return (rindex + steps + 100 * tokenized.length) % tokenized.length;
            };
            return tokenized.map((e, i) => tokenized[rotate(i)]).join("");
        case "rotate-on":
            const index = input.indexOf(rule.letter);
            const base = index + 1;
            const rotateOf = index >= 4 ? base + 1 : base;
            return applyRule(input, {type: "rotate", steps: rotateOf, direction: rule.direction});
        case "reverse":
            return tokenized.map((e, i) => {
                if (i < rule.from || i > rule.to) {
                    return e;
                }
                const reverseIndex = rule.from + (rule.to - i);
                return tokenized[reverseIndex];
            }).join("");
        case "move":
            return tokenized.map((e, i) => {
                if (rule.from < rule.to) {
                    if (i < rule.from) {
                        return e;
                    }
                    if (i < rule.to) {
                        return tokenized[i + 1];
                    }
                    if (i === rule.to) {
                        return tokenized[rule.from];
                    }
                    return e;
                } else {
                    if (i < rule.to) {
                        return e;
                    } else if (i === rule.to) {
                        return tokenized[rule.from];
                    } else if (i <= rule.from) {
                        return tokenized[i - 1];
                    } else {
                        return e;
                    }
                }
            }).join("");
    }
};

const serializeRule = (rule: Rule): string => {
    switch (rule.type) {
        case "swap-position":
            return `swap position ${rule.a} with position ${rule.b}`;
        case "swap-letter":
            return `swap letter ${rule.a} with letter ${rule.b}`;
        case "rotate":
            return `rotate ${rule.direction} ${rule.steps} ${rule.steps === 1 ? "step" : "steps"}`;
        case "rotate-on":
            return `rotate based on position of letter ${rule.letter}`;
        case "reverse":
            return `reverse positions ${rule.from} through ${rule.to}`;
        case "move":
            return `move position ${rule.from} to position ${rule.to}`;
    }
};

const serialize = (rules: Rule[]): string[] => rules.map(serializeRule);

const parseLines = (lines: string[]): Rule[] => lines.map(parseLine);

const testInput: string[] = [
    "swap position 4 with position 0",
    "swap letter d with letter b",
    "reverse positions 0 through 4",
    "rotate left 1 step",
    "move position 1 to position 4",
    "move position 3 to position 0",
    "rotate based on position of letter b",
    "rotate based on position of letter d",
];

export const scrambledLettersAndHash = entryForFile(
    async ({ lines, outputCallback }) => {
        const parsed = parseLines(lines);
        let input = "abcdefgh";
        // let input = "abcde";
        for (const rule of parsed) {
            await outputCallback(input);
            input = applyRule(input, rule);
        }
        await outputCallback(input);
    },
    async ({ lines, outputCallback }) => {
        const target = "fbgdceah";
        const parsed = parseLines(lines);
        for (const permutation of permutationGenerator(target.split(""))) {
            const candidate = permutation.join("");
            const result = parsed.reduce((acc, next) => applyRule(acc, next), candidate);
            if (result === target) {
                await outputCallback("Found it!");
                await outputCallback(candidate);
                return;
            }
        }
        await outputCallback("I'm very sad :(");
        // await outputCallback(target.split("").map((e,i) => i+1).reduce((acc, next) => acc * next))
        // throw Error("Not implemented");
    },
    { key: "scrambled-letters-and-hash", title: "Scrambled Letters and Hash", stars: 2}
);
