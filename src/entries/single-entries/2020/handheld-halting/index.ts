import { entryForFile } from "../../../entry";
import { emptyState, HandheldProgram } from "../support/handheld";
import { buildVisualizer } from "./visualizer";


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
        // const program = parseProgram(lines);
        const program = new HandheldProgram(lines);
        await visualizer.setup(program.program, 1, 0.4);
        const executed = new Set<number>();
        await program
            .setInterceptor(async (s, beforeOrAfter) => {
                if (beforeOrAfter === "after") {
                    return true;
                }
                if (executed.has(s.currentInstruction)) {
                    await visualizer.setStatus(0, "loop");
                    await resultOutputCallback(s.acc);
                    return false;
                } else {
                    executed.add(s.currentInstruction);
                    await visualizer.setExecuted(0, s.currentInstruction);
                    return true;
                }
            })
            .execute();
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
        const program = new HandheldProgram(lines);
        const executions = program.program
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

        await visualizer.setup(program.program, executions.length, 0.25);
        let found = false;
        while (!found) {
            for (const execution of executions) {
                if (found) {
                    return;
                }
                if (execution.stop) {
                    continue;
                }
                execution.state = await
                    program.setInterceptor(async (s, beforeOrAfter, nextInstructionIndex) => {
                        if (beforeOrAfter === "before") {
                            if (execution.executed.has(nextInstructionIndex)) {
                                await visualizer.setStatus(execution.executionIndex, "loop");
                                execution.stop = true;
                                return false;
                            } else if (nextInstructionIndex < 0 || nextInstructionIndex >= program.length) {
                                await visualizer.setStatus(execution.executionIndex, "finished");
                                found = true;
                                await resultOutputCallback(s.acc);
                                return false;
                            } else {
                                return true;
                            }
                        } else {
                            await visualizer.setExecuted(execution.executionIndex, nextInstructionIndex);
                            execution.executed.add(nextInstructionIndex);
                            return false;
                        }
                    })
                    .setInstructionChanger(async (currentInstruction) => {
                        if (currentInstruction === execution.index) {
                            return execution.instruction;
                        }
                        return program.program[currentInstruction];
                    })
                    .execute(execution.state);
            }
        }
    },
    {
        key: "handheld-halting",
        title: "Handheld Halting",
        stars: 2,
        supportsQuickRunning: true,
        customComponent: "pause-and-run",
        embeddedData: true
    }
);
