import { entryForFile } from "../entry";
import { groupBy } from "../../support/sequences";
import { Machine, Instruction, OpCode } from "./chronal-classification";

export const entry = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const pointer = parseInt(lines[0][4], 10);
        let machine = new Machine([0, 0, 0, 0, 0, 0], pointer);
        const instructions = Instruction.fromLines(lines.slice(1), (s) => s as OpCode);
        let iterations = 0;
        while (machine.isExecutable(instructions.length)) {
            const instruction = instructions[machine.nextInstructionAddress];
            const oldMachine = machine;
            machine = machine.execute(instruction);
            const modVal = (++iterations) % 56197;
            if (modVal <= 30) {
                await outputCallback(`{${oldMachine.nextInstructionAddress}} ${JSON.stringify(oldMachine.registers)} | ${instruction} -> ${JSON.stringify(machine.registers)} => [${machine.instructionPointerRegister}] ${machine.nextInstructionAddress}`);
            } else if (modVal === 31) {
                await outputCallback(null);
            } else if (iterations % 100 === 0) {
                await pause();
            }
            if (isCancelled && isCancelled()) {
                await outputCallback("Stopped!");
                break;
            }
        }
        await outputCallback(`Result: ${machine.registers[0]}`);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const pointer = parseInt(lines[0][4], 10);
        let machine = new Machine([1, 0, 0, 0, 0, 0], pointer);
        const instructions = Instruction.fromLines(lines.slice(1), (s) => s as OpCode);
        let iterations = 0;
        const print = 30;
        // const iterationBatch = 56197;
        const iterationBatch = 1;
        while (machine.isExecutable(instructions.length)) {
            const instruction = instructions[machine.nextInstructionAddress];
            const oldMachine = machine;
            machine = machine.execute(instruction);
            const modVal = (++iterations) % iterationBatch;
            if (modVal <= print) {
                await outputCallback(`{${oldMachine.nextInstructionAddress}} ${JSON.stringify(oldMachine.registers)} | ${instruction} -> ${JSON.stringify(machine.registers)} => [${machine.instructionPointerRegister}] ${machine.nextInstructionAddress}`);
            } else if (modVal === print + 1) {
                await outputCallback(null);
            } else if (iterations % 100 === 0) {
                await pause();
            }
            if (isCancelled && isCancelled()) {
                await outputCallback("Stopped!");
                break;
            }
        }
        await outputCallback(`Result: ${machine.registers[0]}`);
    }
);
