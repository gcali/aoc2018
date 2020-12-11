import { entryForFile } from "../../entry";
import { parseMemory, execute, inputGenerator } from "../../../support/intcode";
import { forEachAsync } from "../../../support/async";
import { programAlarm } from "./program-alarm";

interface Connector {
    input: () => Promise<number>;
    output: (e: number) => void;
    close: () => void;
}

function generateConnector(startingInput: number[], additionalOutput?: (e: number) => void): Connector {
    const outputBuffer: number[] = [...startingInput];
    let nextReadIndex = 0;
    let resolver: ((e: number) => void) | null = null;
    let rejector: (() => void) | null = null;
    let isClosed: boolean = false;
    const output = (e: number) => {
        outputBuffer.push(e);
        if (additionalOutput) {
            additionalOutput(e);
        }
        if (resolver !== null) {
            resolver(outputBuffer[nextReadIndex++]);
        }
    };
    const input = async (): Promise<number> => {
        if (isClosed) {
            throw Error("Input is closed");
        }
        if (nextReadIndex < outputBuffer.length) {
            return outputBuffer[nextReadIndex++];
        } else {
            const promise = new Promise<number>((resolve, reject) => {
                resolver = resolve;
                rejector = reject;
            });
            return await promise;
        }
    };
    const close = () => {
        isClosed = true;
        if (rejector) {
            rejector();
        }
    };

    return { output, input, close };
}

function generatePermutations<T>(l: T[]): T[][] {
    const res: T[][] = [];
    if (l.length === 0) {
        return [[]];
    }

    for (let i = 0; i < l.length; i++) {
        const subs = generatePermutations(l.slice(0, i).concat(l.slice(i + 1, l.length)));
        for (const sub of subs) {
            const full = [l[i]].concat(sub);
            res.push(full);
        }
    }
    return res;
}
export const amplificationCircuit = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const baseMemory = parseMemory(lines[0]);
        const permutations = generatePermutations([0, 1, 2, 3, 4]);
        let currentMax = Number.NEGATIVE_INFINITY;
        // permutations = [[0, 1, 2, 3, 4]];
        permutations.forEach((permutation) => {
            let signal = 0;
            for (const id of permutation) {
                const input = inputGenerator([id, signal]);
                const promiseResult = execute({ memory: baseMemory, input, output: (e) => signal = e });
            }
            currentMax = Math.max(currentMax, signal);
        });
        await outputCallback(currentMax);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const baseMemory = parseMemory(lines[0]);
        const permutations = generatePermutations([9, 8, 7, 6, 5]);
        let currentMax = Number.NEGATIVE_INFINITY;
        // permutations = [[0, 1, 2, 3, 4]];
        await forEachAsync(permutations, async (permutation) => {
            const programs = permutation.map((i) => ({
                memory: baseMemory,
                phase: i,
                isLast: false,
                hasExecuted: false,
                inConnector: null as (Connector | null),
                outConnector: null as (Connector | null)
            }));
            programs[programs.length - 1].isLast = true;

            for (let i = 1; i < programs.length; i++) {
                const connector = generateConnector([programs[i].phase]);
                programs[i - 1].outConnector = connector;
                programs[i].inConnector = connector;
            }

            let output: number | null = null;
            const loopConnector = generateConnector([programs[0].phase, 0], (e) => output = e);
            programs[0].inConnector = loopConnector;
            programs[programs.length - 1].outConnector = loopConnector;

            const promises = programs.map((program) => {
                return execute({
                    memory: baseMemory,
                    input: program.inConnector!.input,
                    output: program.outConnector!.output,
                    close: program.outConnector!.close
                });
            });

            await Promise.all(promises);

            if (output == null) {
                throw new Error("No outpu!");
            }
            currentMax = Math.max(currentMax, output);
        });
        await outputCallback(currentMax);
    },
    { key: "amplification-circuit", title: "Amplification Circuit", stars: 2, embeddedData: "amplification-circuit/input"}
);

