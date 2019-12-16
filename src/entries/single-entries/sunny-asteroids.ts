import { entryForFile } from "../entry";
import { Instruction } from './chronal-classification';
import { execute } from '../../support/intcode';
export const sunnyAsteroids = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = lines[0].split(",").map(e => parseInt(e, 10));
        const output: number[] = [];
        await execute({
            memory,
            input: (() => {
                let isFirst = true;
                return async () => { if (isFirst) { return 1; } else { throw Error(); } };
            })(),
            output: (e: number) => output.push(e),
            debug: outputCallback
        });
        // await outputCallback(output[output.length - 1]);
        await outputCallback(output);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = lines[0].split(",").map(e => parseInt(e, 10));
        const output: number[] = [];
        await execute({
            memory,
            input: (() => {
                let isFirst = true;
                return async () => { if (isFirst) { return 5; } else { throw Error(); } };
            })(),
            output: (e: number) => output.push(e)
        });
        console.log(output);
        await outputCallback(output);
    }
);
