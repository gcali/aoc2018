import { entryForFile } from "../../entry";
import { Queue } from '../../../support/data-structure';
import { parse } from 'path';
import PriorityQueue from "priorityqueue";
import { isProbablyPrime } from 'bigint-crypto-utils';
import { setTimeoutAsync } from '../../../support/async';

type Rule = {
    from: string;
    to: string[];
    flatTo: string;
};

const serializeRule = (rule: Rule): string => {
    return `${rule.from} => ${rule.to.join("")}`;
}

const parseRules = (lines: string[]): Rule[] => {
    return lines.map(line => {
        const [from,to] = line.split(" => ");
        return {from, to: parseMolecule(to), flatTo: to};
    });
};

const parseMolecule = (line: string): string[] => {
    let current: string[] = [];
    const result: string[] = [];
    for (let i = 0; i < line.length; i++) {
        if (line[i].toUpperCase() === line[i]) {
            if (current.length > 0) {
                result.push(current.join(""));
                current.length = 0;
            }
        }
        current.push(line[i]);
    }
    if (current.length > 0) {
        result.push(current.join(""));
    }
    return result;
};

const parseLines = (lines: string[]): {rules: Rule[], molecule: string[]} => {
    const separator = lines.findIndex(e => e.length === 0);
    const rules = parseRules(lines.slice(0, separator));
    const molecule = parseMolecule(lines[separator + 1]);
    return {
        rules,
        molecule
    };
}

export const medicineForRudolph = entryForFile(
    async ({ lines, outputCallback }) => {
        const parsed = parseLines(lines);
        const visited = new Set<string>();
        for (const candidate of createCandidates(parsed.rules, parsed.molecule)) {
            visited.add(candidate.join(""));
        }
        if (visited.size < 20) {
            await outputCallback(visited.values());
        }
        await outputCallback(visited.size);
    },
    async ({ lines, outputCallback }) => {
        const parsed = parseLines(lines);

        const appearsInHowManyRules = new Map<string, number>();

        const bottomRules: Rule[] = [];
        const noFromAtoms: Set<string> = new Set<string>();

        parsed.rules.forEach(rule => {
            var tos = new Set<string>();
            rule.to.forEach(r => tos.add(r));
            tos.forEach(target => {
                if (appearsInHowManyRules.has(target)) {
                    appearsInHowManyRules.set(target, appearsInHowManyRules.get(target)! + 1);
                } else {
                    appearsInHowManyRules.set(target, 1);
                }
            });

            const noFrom = rule.to.filter(to => parsed.rules.filter(r => r.from === to).length === 0)
            const isBottom = noFrom.length > 0;
            if (isBottom) {
                noFrom.forEach(f => noFromAtoms.add(f));
                bottomRules.push(rule);
            }
        });
        const unique = [...appearsInHowManyRules.keys()].filter(key => appearsInHowManyRules.get(key)! === 1);
        await outputCallback("Unique: ");
        await outputCallback(unique);
        await outputCallback(appearsInHowManyRules);
        await outputCallback(bottomRules.map(serializeRule));
        await outputCallback(noFromAtoms);

        //here I started noticing a pattern for Rn, Y and Ar; unfortunately I wasn't smart enough to figure all out, but thanks to askaski for his analysis and this:
        const target = parsed.molecule;

        const result = target.length - target.filter(t => t === "Ar" || t === "Rn").length - 2*target.filter(t => t === "Y").length - 1;

        await outputCallback(result);
        await outputCallback("Thanks askalski :)")
        await outputCallback("See https://www.reddit.com/r/adventofcode/comments/3xflz8/day_19_solutions/cy4etju")

    },
    { key: "medicine-for-rudolph", title: "Medicine for Rudolph", stars: 1}
);

function* createCandidates(rules: Rule[], molecule: string[]): Iterable<string[]> {
    for (const rule of rules) {
        for (let i = 0; i < molecule.length; i++) {
            if (molecule[i] === rule.from) {
                const result = molecule.slice(0, i).concat(rule.to).concat(molecule.slice(i + 1));
                yield  result;
            }
        }
    }
}
