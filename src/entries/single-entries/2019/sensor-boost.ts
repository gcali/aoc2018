import { entryForFile } from "../../entry";
import { execute, parseMemory } from '../../../support/intcode';
export const sensorBoost = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const source = lines[0];
        const memory = parseMemory(source);
        let output: number[] = [];
        await execute({
            memory, input: async () => { return 1; }, output: e => {
                output.push(e);
            }, close: () => { }
        })

        await outputCallback(output);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const source = lines[0];
        const memory = parseMemory(source);
        let output: number[] = [];
        await execute({
            memory, input: async () => { return 2; }, output: e => {
                output.push(e);
            }, close: () => { }
        })

        await outputCallback(output);
    }
);
