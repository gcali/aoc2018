type Interceptor = (state: State, beforeOrAfter: "before" | "after", instruction: number) => Promise<boolean>;
type InstructionChanger = (currentInstruction: number) => Promise<Instruction>;
export type Program = Instruction[];
export class HandheldProgram {

    public get length() {
        return this.program.length;
    }
    public program: Program;

    private interceptor?: Interceptor;
    private instructionChanger?: InstructionChanger;
    constructor(program: string[] | Program) {
        if (program.length === 0) {
            this.program = [];
        } else if (typeof program[0] === "string") {
            this.program = parseProgram(program as string[]);
        } else {
            this.program = program as Program;
        }
    }

    public setInterceptor(interceptor: Interceptor) {
        this.interceptor = interceptor;
        return this;
    }

    public setInstructionChanger(changeInstruction?: InstructionChanger) {
        this.instructionChanger = changeInstruction;
        return this;
    }

    public async execute(startState?: State): Promise<State> {
        const state = startState ? {...startState} : emptyState();
        while (true) {
            const nextInstructionIndex = state.currentInstruction;
            const nextInstruction = (this.instructionChanger) ?
                    await this.instructionChanger(nextInstructionIndex) :
                        this.program[nextInstructionIndex];
            if (this.interceptor) {
                const shouldContinue = await this.interceptor(state, "before", nextInstructionIndex);
                if (!shouldContinue) {
                    break;
                }
            }
            executeInstruction(nextInstruction, state);
            if (this.interceptor) {
                const shouldContinue = await this.interceptor(state, "after", nextInstructionIndex);
                if (!shouldContinue) {
                    break;
                }
            }
        }
        return state;

    }
}

export interface Instruction {
    op: "acc" | "jmp" | "nop";
    arg: number;
}

export interface State {
    acc: number;
    currentInstruction: number;
}

export const parseProgram = (lines: string[]): Program => {
    return lines.map((line) => {
        const [op, arg] = line.split(" ");
        return {
            op: op as "jmp" | "acc" | "nop",
            arg: parseInt(arg, 10)
        };
    });
};

const executeInstruction = (instruction: Instruction, state: State) => {
    let shouldChangeInstruction = true;
    switch (instruction.op) {
        case "acc":
            state.acc += instruction.arg;
            break;
        case "jmp":
            state.currentInstruction += instruction.arg;
            shouldChangeInstruction = false;
            break;
        case "nop":
            break;
        default:
            throw new Error("Invalid instruction");
    }
    if (shouldChangeInstruction) {
        state.currentInstruction++;
    }
};

export const emptyState = (): State => ({
    acc: 0,
    currentInstruction: 0
});
