import { setTimeoutAsync } from "../../../support/async";
import { entryForFile } from "../../entry";
import { emptyState, execute, parseProgram } from "./common/assembunny";


export const leonardosMonorail = entryForFile(
    async ({ lines, outputCallback }) => {
        const program = parseProgram(lines);
        const state = emptyState();
        await execute(program, state);

        await outputCallback(state.registers.a);
    },
    async ({ lines, outputCallback }) => {
        const program = parseProgram(lines);
        const state = emptyState();
        state.registers.c = 1;
        await execute(program, state);

        await outputCallback(state.registers.a);
    },
    { key: "leonardos-monorail", title: "Leonardo's Monorail"}
);
