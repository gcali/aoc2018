import { exec } from "child_process";
import { entryForFile } from "../../../entry";
import { buildVisualizer } from "./visualizer";

export interface Instruction {
    op: "acc" | "jmp" | "nop";
    arg: number;
}

export interface State {
    acc: number;
    currentInstruction: number;
}

const parseLines = (lines: string[]): Instruction[] => {
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

const emptyState = (): State => ({
    acc: 0,
    currentInstruction: 0
});

const execute = async (
    program: Instruction[],
    startState: State,
    options?: {
        interceptor?: (state: State, currentInstruction?: Instruction) => Promise<boolean>,
        changeInstruction?: (currentInstruction: number) => Promise<Instruction>,
    }): Promise<State> => {
        const state = {...startState};
        while (true) {
            const nextInstructionIndex = state.currentInstruction;
            const nextInstruction = (options && options.changeInstruction) ?
                    await options.changeInstruction(nextInstructionIndex) :
                        program[nextInstructionIndex];
            if (options && options.interceptor) {
                const shouldContinue = await options.interceptor(state, nextInstruction);
                if (!shouldContinue) {
                    break;
                }
            }
            executeInstruction(nextInstruction, state);
        }
        return state;
    };

export const handheldHalting = entryForFile(
    async ({
        lines,
        resultOutputCallback,
        screen,
        pause,
        setAutoStop
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const program = parseLines(lines);
        await visualizer.setup(program, 1, 0.4);
        const executed = new Set<number>();
        await execute(program, emptyState(), {
            interceptor: async (s) => {
                if (executed.has(s.currentInstruction)) {
                    await visualizer.setStatus(0, "loop");
                    await resultOutputCallback(s.acc);
                    return false;
                } else {
                    executed.add(s.currentInstruction);
                    await visualizer.setExecuted(0, s.currentInstruction);
                    return true;
                }
            }
        });
    },
    async ({
        lines,
        resultOutputCallback,
        screen,
        pause,
        setAutoStop
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const program = parseLines(lines);
        const executions = program
            .map((inst, index) => ({inst, index}))
            .filter((e) => e.inst.op === "nop" || e.inst.op === "jmp")
            .map((e, executionIndex) => {
                return {
                    index: e.index,
                    instruction: {
                        op: e.inst.op === "nop" ? "jmp" : "nop" as "jmp" | "nop" | "acc",
                        arg: e.inst.arg
                    },
                    state: emptyState(),
                    stop: false,
                    executed: new Set<number>(),
                    executionIndex
                };
            });

        await visualizer.setup(program, executions.length, 0.25);
        let found = false;
        while (!found) {
            for (const execution of executions) {
                if (found) {
                    return;
                }
                if (execution.stop) {
                    continue;
                }
                let toExecute = 1;
                execution.state = await execute(program, execution.state, {
                    interceptor: async (s) => {
                        if (execution.executed.has(s.currentInstruction)) {
                            await visualizer.setStatus(execution.executionIndex, "loop");
                            execution.stop = true;
                            return false;
                        } else if (s.currentInstruction < 0 || s.currentInstruction >= program.length) {
                            await visualizer.setStatus(execution.executionIndex, "finished");
                            found = true;
                            await resultOutputCallback(s.acc);
                            return false;
                        } else {
                            if (toExecute > 0) {
                                await visualizer.setExecuted(execution.executionIndex, s.currentInstruction);
                                execution.executed.add(s.currentInstruction);
                                toExecute--;
                                return true;
                            } else {
                                return false;
                            }
                        }
                    },
                    changeInstruction: async (currentInstruction) => {
                        if (currentInstruction === execution.index) {
                            return execution.instruction;
                        }
                        return program[currentInstruction];
                    }
                });
            }
        }
    },
    {
        key: "handheld-halting",
        title: "Handheld Halting",
        stars: 2,
        supportsQuickRunning: true,
        customComponent: "pause-and-run"
    }
);
