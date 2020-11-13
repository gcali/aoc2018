import { setTimeoutAsync } from '../../../../support/async';

interface Registers {
    a: number;
    b: number;
    c: number;
    d: number;
}

type RegisterKey = keyof Registers;
interface State {
    registers: Registers;
    currentInstruction: number;
}

type Argument = RegisterKey | number;

type DoubleArgumentInstruction = {
    type: "cpy" | "jnz",
    args: [Argument, Argument]
};

type SingleArgumentInstruction  = {
    type: "inc" | "dec" | "tgl",
    args: Argument
};

type Instruction = SingleArgumentInstruction | DoubleArgumentInstruction;

const isRegister = (e: any): e is RegisterKey => {
    return e === "a" || e === "b" || e === "c" || e === "d";
};

const isSingleArgument = (i: Instruction): i is SingleArgumentInstruction => {
    return (i.args as [Argument,Argument]).length !== undefined;
}



const executeInstruction = (instruction: Instruction, state: State, instructions: Instruction[]): void => {
    let shouldIncreaseCurrentInstruction = true;
    switch (instruction.type) {
        case "cpy":
            if (!isRegister(instruction.args[1])) {
                break;
            }
            const value = isRegister(instruction.args[0]) ? state.registers[instruction.args[0]] : instruction.args[0];
            state.registers[instruction.args[1]] = value;
            break;
        case "inc":
            if (!isRegister(instruction.args)) {
                break;
            }
            state.registers[instruction.args]++;
            break;
        case "dec":
            if (!isRegister(instruction.args)) {
                break;
            }
            state.registers[instruction.args]--;
            break;
        case "jnz":
            if (!isRegister(instruction.args[0])) {
                break;
            }
            if (isRegister(instruction.args[1])) {
                break;
            }
            if (state.registers[instruction.args[0]] !== 0) {
                shouldIncreaseCurrentInstruction = false;
                state.currentInstruction += instruction.args[1];
            }
            break;
        case "tgl":
            const delta = isRegister(instruction.args) ? state.registers[instruction.args] : instruction.args;
            const instructionToChange = instructions[state.currentInstruction + delta];
            if (instructionToChange) {
                if (isSingleArgument(instructionToChange)) {
                    if (instructionToChange.type === "inc") {
                        instructionToChange.type = "dec";
                    } else {
                        instructionToChange.type = "inc";
                    }
                } else {
                    if (instructionToChange.type === "jnz") {
                        instructionToChange.type = "cpy";
                    } else {
                        instructionToChange.type = "jnz";
                    }
                }
            }
            break;
    }

    if (shouldIncreaseCurrentInstruction) {
        state.currentInstruction++;
    }
};

export const prettyPrint = (state: State): string => {
    const output: [string, string][] = [];
    output.push(["I", state.currentInstruction.toString().padStart(5)]);
    for (const register of ["a","b","c","d"] as RegisterKey[]) {
        output.push([register, state.registers[register].toString().padStart(5)]);
    }

    const maxOutLength = output.map(e => e[1].length).reduce((acc,next) => Math.max(acc, next));

    const result: string[] = [];

    const simpleLine = "+" + "-".repeat(3) + "+" + "-".repeat(maxOutLength + 2) + "+";

    result.push(simpleLine);
    for (const line of output) {
        result.push(`| ${line[0]} | ${line[1]} |`);
        result.push(simpleLine);
    }

    return result.join("\n");
};

export const execute = async (program: Instruction[], state: State, executionCallback?: (program: Instruction[], state: State) => Promise<void>): Promise<void> => {
    const programExecution = program.map(instruction => ({...instruction}));
    let i = 0;
    while (true) {
        const currentInstruction = programExecution[state.currentInstruction];
        if (!currentInstruction) {
            return;
        }
        executeInstruction(currentInstruction, state, programExecution);
        if (executionCallback) {
            await executionCallback(programExecution, state);
        }
        // console.log(state);
        // await setTimeoutAsync(1000);
    }
};

export const parseProgram = (lines: string[]): Instruction[] => {
    return lines.map((line) => {
        const tokens = line.split(" ");
        const instruction = tokens[0];
        if (instruction === "cpy") {
            return {
                type: instruction,
                args: [isRegister(tokens[1]) ? tokens[1] : parseInt(tokens[1], 10), tokens[2] as RegisterKey]
            };
        } else if (instruction === "jnz") {
            return {
                type: instruction,
                args: [tokens[1] as RegisterKey, parseInt(tokens[2], 10)]
            };
        } else if (instruction === "inc" || instruction === "dec" || instruction === "tgl") {
            return {
                type: instruction,
                args: tokens[1] as RegisterKey
            };
        } else {
            throw new Error("invalid instruction " + instruction);
        }
    });
};

export const emptyState = (): State => {
    return {
        currentInstruction: 0,
        registers: {
            a: 0,
            b: 0,
            c: 0,
            d: 0
        }
    };
};
