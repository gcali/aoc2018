import { setTimeoutAsync } from '../../../support/async';
import { entryForFile } from "../../entry";

type Registers = {
    a: number;
    b: number;
    c: number;
    d: number;
}

type RegisterKey = keyof Registers;
type State = {
    registers: Registers;
    currentInstruction: number;
}

type Instruction = {
    type: "cpy",
    args: [number | RegisterKey, keyof Registers]
} | {
    type: "inc" | "dec",
    args: keyof Registers
} | {
    type: "jnz",
    args: [keyof Registers, number]
};

const isRegister = (e: any): e is RegisterKey => {
    return e === "a" || e === "b" || e === "c" || e === "d";
}



const executeInstruction = (instruction: Instruction, state: State): void => {
    let shouldIncreaseCurrentInstruction = true;
    switch (instruction.type) {
        case "cpy":
            const value = isRegister(instruction.args[0]) ? state.registers[instruction.args[0]] : instruction.args[0];
            state.registers[instruction.args[1]] = value;
            break;
        case "inc":
            state.registers[instruction.args]++;
            break;
        case "dec":
            state.registers[instruction.args]--;
            break;
        case "jnz":
            if (state.registers[instruction.args[0]] !== 0) {
                shouldIncreaseCurrentInstruction = false;
                state.currentInstruction += instruction.args[1];
            }
            break;
    }

    if (shouldIncreaseCurrentInstruction) {
        state.currentInstruction++;
    }
};

const execute = async (program: Instruction[], state: State): Promise<void> =>{
    while (true) {
        const currentInstruction = program[state.currentInstruction];
        if (!currentInstruction) {
            return;
        }
        executeInstruction(currentInstruction, state);
        // console.log(state);
        // await setTimeoutAsync(1000);
    }
}

const parseLines = (lines: string[]): Instruction[] => {
    return lines.map(line => {
        const tokens = line.split(" ");
        const instruction = tokens[0];
        if (instruction === "cpy") {
            return {
                type: instruction,
                args: [isRegister(tokens[1]) ? tokens[1] : parseInt(tokens[1],10), tokens[2] as RegisterKey]
            };
        } else if (instruction === "jnz") {
            return {
                type: instruction,
                args: [tokens[1] as RegisterKey, parseInt(tokens[2], 10)]
            };
        } else if (instruction === "inc" || instruction === "dec") {
            return {
                type: instruction,
                args: tokens[1] as RegisterKey
            };
        } else {
            throw new Error("invalid instruction " + instruction);
        }
    });
}

const emptyState = (): State => {
    return {
        currentInstruction: 0,
        registers: {
            a: 0,
            b: 0,
            c: 0,
            d: 0
        }
    };
}

export const leonardosMonorail = entryForFile(
    async ({ lines, outputCallback }) => {
        const program = parseLines(lines);
        const state = emptyState();
        await execute(program, state);

        await outputCallback(state.registers.a);
    },
    async ({ lines, outputCallback }) => {
        const program = parseLines(lines);
        const state = emptyState();
        state.registers.c = 1;
        await execute(program, state);

        await outputCallback(state.registers.a);
    },
    { key: "leonardos-monorail", title: "Leonardo's Monorail"}
);