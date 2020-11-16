import { setTimeoutAsync } from '../../../support/async';
import { entryForFile } from "../../entry";
import { emptyState, execute, parseProgram, prettyPrint } from './common/assembunny';

export const safeCracking = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled  }) => {
        const program = parseProgram(lines);
        const state = emptyState();
        state.registers["a"] = 7;
        await execute(program, state, async (program, state) => {
            await outputCallback(null);
            await outputCallback(prettyPrint(state, program));
            // await setTimeoutAsync(100);
            await pause();
            if (isCancelled && isCancelled()) {
                return false;
            }
            return true;
        });
        // await outputCallback(prettyPrint(state));
        await outputCallback(state.registers["a"]);
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "safe-cracking", title: "Safe Cracking", hasCustomComponent: true}
);