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

        parsed.rules.forEach(rule => {
            rule.to.forEach(target => {
                if (appearsInHowManyRules.has(target)) {
                    appearsInHowManyRules.set(target, appearsInHowManyRules.get(target)! + 1);
                } else {
                    appearsInHowManyRules.set(target, 1);
                }
            })
        });
        const unique = [...appearsInHowManyRules.keys()].filter(key => appearsInHowManyRules.get(key)! === 1);
        await outputCallback("Unique: ");
        await outputCallback(unique);

        const maxReduction = parsed.rules.map(r => r.to.length).reduce((acc, next) => Math.max(acc, next));
        await outputCallback("Max reduction: " + maxReduction);

        await setTimeoutAsync(1000);

        const visited = new Set<string>();
        // const queue = new Queue<{distance: number; molecule: string[]}>();
        const priorityQueue = new PriorityQueue<{distance: number; molecule: string[]}>({
            comparator: (a, b) => {
                return (a.distance + (a.molecule.length/maxReduction)) - (b.distance + (b.molecule.length/maxReduction));
            }
        });
        let found = false;
        priorityQueue.push({molecule: parsed.molecule, distance: 0});
        let minLength = Number.POSITIVE_INFINITY;
        let iteration = 0;
        while (!found) {
            iteration++;
            if (iteration % 10000 === 0) {
                await outputCallback("Iteration: " + (iteration/1000) + "k");
            }
            if (priorityQueue.isEmpty()) {
                throw new Error("Not found");
            }
            const next = priorityQueue.pop();
            if (next.molecule.length < minLength) {
                minLength = next.molecule.length;
                await outputCallback(`New minLength: ${minLength}`);
            }
            const flatNext = next.molecule.join("");
            for (const rule of parsed.rules) {
                let i = 0;
                const occurrences: number[] = [];
                while (i < flatNext.length) {
                    const nextOccurrence = flatNext.indexOf(rule.flatTo, i);
                    if (nextOccurrence < 0) {
                        break;
                    }
                    occurrences.push(nextOccurrence);
                    i = nextOccurrence + 1;
                }
                const ruleLength = rule.flatTo.length;
                const newCandidates = occurrences.map(index => {
                    return flatNext.slice(0, index).concat(rule.from).concat(flatNext.slice(index + ruleLength));
                });
                for (const candidate of newCandidates) {
                    if (visited.has(candidate)) {
                        continue;
                    }
                    if (candidate === "e") {
                        await outputCallback("Found in: " + next.distance + 1);
                        found = true;
                        break;
                    }
                    visited.add(candidate);
                    priorityQueue.push({distance: next.distance + 1, molecule: parseMolecule(candidate)});
                }
            }
        }
        /*

        const target = parsed.molecule.join("");
        const queue = new Queue<{distance: number, molecule: string[]}>();
        const discovered = new Set<string>();
        discovered.add("e");
        queue.add({molecule: ['e'], distance: 0});
        let found = false;
        let maxLength = 0;
        while (!found) {
            const next = queue.get();
            if (!next) {
                throw new Error("Did not find any result");
            }
            if (next.molecule.length > parsed.molecule.length) {
                await outputCallback("Too long, skipping");
                continue;
            }
            if (next.molecule.length > maxLength) {
                maxLength = next.molecule.length;
                await outputCallback(`Reached length ${maxLength}, target length: ${parsed.molecule.length}`);
            }
            for (const candidate of createCandidates(parsed.rules, next.molecule)) {
                const molecule = candidate.join("");
                const newDistance = next.distance+1;
                if (molecule === target) {
                    await outputCallback("Steps: " + newDistance);
                    found = true;
                    break;
                }
                if (!discovered.has(molecule)) {
                    discovered.add(molecule);
                    queue.add({distance: newDistance,  molecule: candidate})
                }
            }
        }
        */
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
