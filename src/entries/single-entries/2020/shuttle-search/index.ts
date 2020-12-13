import { modInverse } from "../../../../support/algebra";
import { entryForFile } from "../../../entry";

const getBusIDs = (line: string): number[] => {
    return line.split(",").map((l) => {
        const n = parseInt(l, 10);
        if (n.toString() === l) {
            return n;
        } else {
            return -1;
        }
    }).filter((n) => n > 0);
};

interface Equation {
    mod: bigint;
    value: bigint;
}

const parseEquations = (line: string): Equation[] => {
    const result: Equation[] = [];
    let v = 0;
    for (const d of line.split(",")) {
        if (d !== "x") {
            result.push({
                mod: BigInt(parseInt(d, 10)),
                value: BigInt(-v)
            });
        }
        v++;
    }
    return result;
};

export const shuttleSearch = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const ts = parseInt(lines[0], 10);
        const ids = getBusIDs(lines[1]);
        const result = ids.map((id) => ({id, ts: id - (ts % id)})).reduce((acc, next) => acc.ts < next.ts ? acc : next);
        await resultOutputCallback(result.id * result.ts);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const equations = parseEquations(lines[1]);
        const mainMod = equations.reduce((acc, next) => acc * next.mod, 1n);
        const toSolve: Array<{a: bigint; c: bigint; y: bigint}> = [];
        for (const equation of equations) {
            const c = mainMod / equation.mod;
            const a = equation.value;
            const y = modInverse(c, equation.mod);
            toSolve.push({
                a,
                c,
                y
            });
        }
        let result = toSolve.reduce((acc, next) => acc + next.a * next.c * next.y, 0n) % mainMod;
        if (result < 0) {
            result += mainMod;
        }
        await resultOutputCallback(result.toString());
    },
    {
        key: "shuttle-search",
        title: "Shuttle Search",
        embeddedData: true,
        stars: 2,
        supportsQuickRunning: true
    }
);
