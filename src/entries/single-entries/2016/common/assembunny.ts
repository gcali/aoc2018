import { setTimeoutAsync } from "../../../../support/async";

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

interface DoubleArgumentInstruction {
    type: "cpy" | "jnz";
    args: [Argument, Argument];
}

interface SingleArgumentInstruction {
    type: "inc" | "dec" | "tgl";
    args: Argument;
}

type Instruction = SingleArgumentInstruction | DoubleArgumentInstruction;

const isRegister = (e: any): e is RegisterKey => {
    return e === "a" || e === "b" || e === "c" || e === "d";
};

const isSingleArgument = (i: Instruction): i is SingleArgumentInstruction => {
    return (i.args as [Argument, Argument]).pop === undefined;
};

const parseArgument = (s: string): Argument => {
    if (isRegister(s)) {
        return s;
    } else {
        return parseInt(s, 10);
    }
};

const argumentToValue = (a: Argument, state: State): number => {
    if (isRegister(a)) {
        return state.registers[a];
    }
    return a;
};



const executeInstruction = (instruction: Instruction, state: State, instructions: Instruction[]): void => {
    let shouldIncreaseCurrentInstruction = true;
    switch (instruction.type) {
        case "cpy":
            if (!isRegister(instruction.args[1])) {
                break;
            }
            const value = argumentToValue(instruction.args[0], state); // isRegister(instruction.args[0]) ? state.registers[instruction.args[0]] : instruction.args[0];
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
            // if (!isRegister(instruction.args[0])) {
            //     break;
            // }
            // if (isRegister(instruction.args[1])) {
            //     break;
            // }
            const a = argumentToValue(instruction.args[0], state);
            if (a !== 0) {
                shouldIncreaseCurrentInstruction = false;
                state.currentInstruction += argumentToValue(instruction.args[1], state);
                    // isRegister(instruction.args[1]) ? state.registers[instruction.args[1]] : instruction.args[1];
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

export const prettyPrint = (state: State, program: Instruction[]): string => {
    const output: Array<[string, string]> = [];
    output.push(["I", state.currentInstruction.toString().padStart(5)]);
    for (const register of ["a", "b", "c", "d"] as RegisterKey[]) {
        output.push([register, state.registers[register].toString().padStart(5)]);
    }

    const maxOutLength = output.map((e) => e[1].length).reduce((acc, next) => Math.max(acc, next));

    const result: string[] = [];

    const simpleLine = "+" + "-".repeat(3) + "+" + "-".repeat(maxOutLength + 2) + "+";

    result.push(simpleLine);
    for (const line of output) {
        result.push(`| ${line[0]} | ${line[1]} |`);
        result.push(simpleLine);
    }

    for (let i = 0; i < program.length; i++) {
        result.push(
            (i !== state.currentInstruction ? "   " : "-> ")
             + `${program[i].type} ${JSON.stringify(program[i].args)}`
        );
    }

    return result.join("\n");
};

export const execute = async (program: Instruction[], state: State, executionCallback?: (program: Instruction[], state: State) => Promise<boolean>): Promise<void> => {
    const programExecution = program.map((instruction) => ({...instruction}));
    const i = 0;
    while (true) {
        const currentInstruction = programExecution[state.currentInstruction];
        if (!currentInstruction) {
            return;
        }
        executeInstruction(currentInstruction, state, programExecution);
        if (executionCallback) {
            const result = await executionCallback(programExecution, state);
            if (!result) {
                return;
            }
        }
        // console.log(state);
        // await setTimeoutAsync(1000);
    }
};

export const parseProgram = (lines: string[]): Instruction[] => {
    return lines
    .map((line) => line.trim())
    .filter((line) => line)
    .filter((line) => !line.startsWith("#"))
    .map((line) => {
        const tokens = line.split(" ");
        const instruction = tokens[0];
        if (instruction === "cpy" || instruction === "jnz") {
            return {
                type: instruction,
                args: [parseArgument(tokens[1]), parseArgument(tokens[2])]
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
