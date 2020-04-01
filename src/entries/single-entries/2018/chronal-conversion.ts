import { entryForFile } from "../../entry";
import { Machine, Instruction, OpCode } from './chronal-classification';

export const chronalConversion = entryForFile(
    async ({ lines, outputCallback }) => {
        const pointer = parseInt(lines[0][4], 10);
        let machine = new Machine([103548, 0, 0, 0, 0, 0], pointer);
        const instructions = Instruction.fromLines(lines.slice(1), (s) => s as OpCode);
        while (machine.isExecutable(instructions.length)) {
            const instruction = instructions[machine.nextInstructionAddress];
            machine = machine.execute(instruction);
            if (machine.nextInstructionAddress === instructions.length -3) {
                await outputCallback(machine.registers[4]);
            }
        }
    },
    async ({ lines, outputCallback }) => {
        const pointer = parseInt(lines[0][4], 10);
        const uniques = new Set<number>();
        let lastFour: number = 0;
        let machine = new Machine([103549, 0, 0, 0, 0, 0], pointer);
        const instructions = Instruction.fromLines(lines.slice(1), (s) => s as OpCode);
        while (machine.isExecutable(instructions.length)) {
            await outputCallback(`${machine.nextInstructionAddress.toString().padStart(2, " ")} ${[0,1,2,3,4,5].map(i => machine.registers[i].toString().padStart(10, " ")).join(" ")}`);
            const instruction = instructions[machine.nextInstructionAddress];
            machine = machine.execute(instruction);
        }
        await outputCallback("Last four: " + lastFour);
    }
);