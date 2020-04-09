import { entryForFile } from "../../entry";
import { execute, parseMemory } from "../../../support/intcode";
export const sensorBoost = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const source = lines[0];
        const memory = parseMemory(source);
        const output: number[] = [];
        await execute({
            memory, input: async () => 1, output: (e) => {
                output.push(e);
            }, close: () => { }
        });

        await outputCallback(output);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const source = lines[0];
        const memory = parseMemory(source);
        const output: number[] = [];
        await execute({
            memory, input: async () => 2, output: (e) => {
                output.push(e);
            }, close: () => { }
        });

        await outputCallback(output);
    },
    { key: "sensor-boost", title: "Sensor Boost", stars: 2, }
);
