import { entryForFile } from "../../entry";
import { permutationGenerator } from "../../../support/sequences";

interface AdjacencyRule {
    adjacents: [string, string];
    value: number;
}

const parseRules = (lines: string[]): {
    participants: string[],
    rules: AdjacencyRule[]
} => {
    const participants = [...new Set<string>(
        lines.map((l) => l.split(" ")[0])
    ).values()];

    const rules = lines.map((line) => {
        const tokens = line.split(" ");
        const sign = tokens.includes("gain") ? 1 : -1;
        const value = parseInt(tokens[3], 10);
        const rule: AdjacencyRule = {
            adjacents: [tokens[0], tokens[tokens.length - 1].slice(0, -1)],
            value: sign * value
        };
        return rule;
    });

    return {
        participants,
        rules
    };
};

const calculateValue = (assignment: string[], rules: AdjacencyRule[]): number => {
    let value = 0;
    for (let i = 0; i < assignment.length; i++) {
        const assignees = [assignment[i], assignment[(i + 1) % assignment.length]];
        const matchingRules = rules.filter(
            (rule) => rule.adjacents.includes(assignees[0]) && rule.adjacents.includes(assignees[1])
        );
        if (matchingRules.length !== 2) {
            throw new Error("Could not find enough rules for " + JSON.stringify(assignees));
        }
        value += matchingRules.reduce((acc, next) => acc + next.value, 0);
    }
    return value;
};

export const knightsOfTheDinnerTable = entryForFile(
    async ({ lines, outputCallback }) => {
        const { participants, rules } = parseRules(lines);

        await outputCallback({
            length: participants.length,
            participants
        });

        let bestValue = Number.NEGATIVE_INFINITY;
        for (const p of permutationGenerator(participants)) {
            bestValue = Math.max(bestValue, calculateValue(p, rules));
        }
        await outputCallback("Best: " + bestValue);
    },
    async ({ lines, outputCallback }) => {
        const { participants, rules } = parseRules(lines);

        participants.push("Myself");

        participants.forEach((participant) => {
            rules.push({
                adjacents: ["Myself", participant],
                value: 0
            });
            rules.push({
                adjacents: [participant, "Myself"],
                value: 0
            });
        });

        await outputCallback({
            length: participants.length,
            participants
        });

        let bestValue = Number.NEGATIVE_INFINITY;
        for (const p of permutationGenerator(participants)) {
            bestValue = Math.max(bestValue, calculateValue(p, rules));
        }
        await outputCallback("Best: " + bestValue);
    },
    {
        key: "knights-of-the-dinner-table",
        title: "Knights of the Dinner Table",
        stars: 2
    }
);
