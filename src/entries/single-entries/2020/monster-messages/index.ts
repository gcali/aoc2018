import { start } from "repl";
import { Queue } from "../../../../support/data-structure";
import { buildGroupsFromSeparator } from "../../../../support/sequences";
import { entryForFile } from "../../../entry";

const isMatchTerminal = (match: FullMatch): match is TerminalMatch => {
    return typeof match === "string";
};

const isMatchList = (match: FullMatch): match is ListMatch => {
    const cast = match as number[][];
    return cast.length !== undefined && cast.length > 0 && cast[0].length !== undefined;
};

type TerminalMatch = string;
type SimpleMatch = number[];
type ListMatch = number[][];
type FullMatch = TerminalMatch | SimpleMatch | ListMatch;

interface Rule {
    key: number;
    match: FullMatch;
}

interface RuleIndex {[key: number]: Rule; }

const parseRules = (lines: string[]): RuleIndex => {
    return lines.map((line) => {
        const [a, b] = line.split(": ");
        const clean = b.trim();
        const match: FullMatch = clean.includes("|") ?
              (clean.split(" | ").map((e) => e.split(" ").map((x) => parseInt(x, 10))))
            : (clean.includes("\"") ? clean.replaceAll("\"", "") : clean.split(" ").map((e) => parseInt(e, 10)));
        return {
            key: parseInt(a, 10),
            match
        } as Rule;
    }).sort((a, b) => a.key - b.key).reduce((acc, next) => {
        acc[next.key] = next;
        return acc;
    }, {} as RuleIndex);
};

const buildAll = (match: FullMatch, rules: RuleIndex): string[] => {
    if (isMatchTerminal(match)) {
        return [match];
    } else if (isMatchList(match)) {
        const nested = match.flatMap((m) => buildAll(m, rules));
        return nested;
    } else {
        const toConcat = match.map((r) => buildAll(rules[r].match, rules));
        return combine(toConcat);
    }
};

const combine = (elems: string[][]): string[] => {
    if (elems.length === 0) {
        return [""];
    }
    if (elems.length === 1) {
        return elems[0];
    }
    return elems[0].flatMap((e) => combine(elems.slice(1)).map((x) => e + x));
};

interface QElement {current: Array<string|Rule>; }

const isBuiltFromStart = (target: string, pool: string[]): boolean => {
    if (target.length === 0) {
        return true;
    }
    for (const candidate of pool) {
        if (target.startsWith(candidate)) {
            return isBuiltFromStart(target.slice(candidate.length), pool);
        }
    }
    return false;
};

const isBuiltFromStartEnd = (target: string, startPool: string[], endPool: string[]): boolean => {
    if (target.length === 0) {
        return true;
    }
    for (const startCandidate of startPool) {
        if (target.startsWith(startCandidate)) {
            for (const endCandidate of endPool) {
                if (target.endsWith(endCandidate)) {
                    return isBuiltFromStartEnd(
                        target.slice(startCandidate.length, -endCandidate.length),
                        startPool,
                        endPool
                    );
                }
            }
        }
    }
    return false;
};

const isRepetitionOf = (target: string, repetition: string): boolean => {
    if (target.length === 0) {
        return true;
    }
    if (!target.startsWith(repetition)) {
        return false;
    }
    return isRepetitionOf(target.slice(repetition.length), repetition);
};

const isPalindromeOf = (target: string, a: string, b: string): boolean => {
    if (target.length === 0) {
        return true;
    }
    if (!target.startsWith(a)) {
        return false;
    }
    if (!target.endsWith(b)) {
        return false;
    }
    return isPalindromeOf(target.slice(a.length, -b.length), a, b);
};

export const monsterMessages = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const groups = [...buildGroupsFromSeparator(lines, (e) => e.trim().length === 0)];
        const rules = parseRules(groups[0]);
        const data = groups[1];
        const built = buildAll(rules[0].match, rules);
        const lookup = new Set<string>(built);
        await resultOutputCallback(data.filter((e) => lookup.has(e)).length);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const groups = [...buildGroupsFromSeparator(lines, (e) => e.trim().length === 0)];
        const rules = parseRules(groups[0]);
        const data = groups[1];
        const as = buildAll(rules[42].match, rules);
        const bs = buildAll(rules[31].match, rules);
        console.log(as);
        console.log(bs);
        await resultOutputCallback(data.filter((e) => {
            for (let i = 1; i < e.length - 1; i++) {
                const a = e.slice(0, i);
                const b = e.slice(i);
                if (isBuiltFromStart(a, as) && isBuiltFromStartEnd(b, as, bs)) {
                    return true;
                }
            }
            return false;
        }).length);
        // const built = buildAll(rules[0].match, rules, []);
        // await outputCallback(built);
        // await outputCallback(built.filter(e => e.includes("8") || e.includes("11")));
    },
    {
        key: "monster-messages",
        title: "Monster Messages",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);
