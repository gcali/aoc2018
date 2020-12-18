import { factorial } from "../../../support/algebra";
import { setTimeoutAsync } from "../../../support/async";
import { entryForFile } from "../../entry";
import { emptyState, execute, parseProgram, prettyPrint } from "./common/assembunny";

export const safeCracking = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled  }) => {
        const program = parseProgram(lines);
        const state = emptyState();
        state.registers.a = 7;
        await execute(program, state, async (executingProgram, executingState) => {
            await outputCallback(null);
            await outputCallback(prettyPrint(executingState, executingProgram));
            // await setTimeoutAsync(100);
            await pause();
            if (isCancelled && isCancelled()) {
                return false;
            }
            return true;
        });
        await outputCallback(state.registers.a);
    },
    async ({ lines, outputCallback }) => {
        const getValue = (ln: number): number => {
            const v = parseInt(lines[ln].split(" ")[1], 10);
            return v;
        };
        const result = factorial(12) + getValue(19) * getValue(20);
        await outputCallback("I'm not sure whether the solution is universal; it does work on my input");
        await outputCallback(result);
    },
    {
        key: "safe-cracking",
        title: "Safe Cracking",
        stars: 2,
        customComponent: "pause-and-run"
    }
);
