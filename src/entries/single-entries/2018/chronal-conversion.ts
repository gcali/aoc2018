import { entryForFile } from "../../entry";
import { Machine, Instruction, OpCode, MutableMachine } from "./chronal-classification";

export const chronalConversion = entryForFile(
    async ({ lines, outputCallback }) => {
        const pointer = parseInt(lines[0][4], 10);
        const machine = new MutableMachine([103548, 0, 0, 0, 0, 0], pointer);
        const instructions = Instruction.fromLines(lines.slice(1), (s) => s as OpCode);
        while (machine.isExecutable(instructions.length)) {
            const instruction = instructions[machine.nextInstructionAddress];
            machine.execute(instruction);
            if (machine.nextInstructionAddress === instructions.length - 3) {
                await outputCallback(machine.registers[4]);
            }
        }
    },
    async ({ lines, outputCallback }) => {
        const pointer = parseInt(lines[0][4], 10);
        const uniques = new Set<number>();
        let lastFour: number = 0;
        let iterations = 0;
        const machine = new MutableMachine([103549, 0, 0, 0, 0, 0], pointer);
        const instructions = Instruction.fromLines(lines.slice(1), (s) => s as OpCode);
        if (instructions[28].code !== "eqrr") {
            await outputCallback("Sorry, this solution is hardcoded on my input");
            throw new Error("Sorry, this solution is hardcoded on my input");
        }
        while (machine.isExecutable(instructions.length)) {
            const instruction = instructions[machine.nextInstructionAddress];
            if (instruction.lineNumber === 28) {
                if (++iterations % 10 === 0) {
                    await outputCallback(`New comparison, ${iterations.toString().padStart(6, " ")}`);
                }
                const fourValue = machine.registers[4];
                if (uniques.has(fourValue)) {
                    break;
                }
                uniques.add(fourValue);
                lastFour = fourValue;
            }
            machine.execute(instruction);
        }
        await outputCallback("Last four: " + lastFour);
    },
    { key: "chronal-conversion", title: "Chronal Conversion", stars: 2, }
);
