import { entryForFile } from "../entry";
import { groupBy } from "@/support/sequences";

type OpCode =
    "addr" | "addi" |
    "mulr" | "muli" |
    "banr" | "bani" |
    "borr" | "bori" |
    "setr" | "seti" |
    "gtir" | "gtri" | "gtrr" |
    "eqir" | "eqri" | "eqrr";

const codeList: OpCode[] = [
    "addr", "addi",
    "mulr", "muli",
    "banr", "bani",
    "borr", "bori",
    "setr", "seti",
    "gtir", "gtri", "gtrr",
    "eqir", "eqri", "eqrr"
];


class Instruction {
    constructor(public code: OpCode | number, public a: number, public b: number, public output: number) {
    }

    public setCode(code: OpCode): Instruction {
        return new Instruction(code, this.a, this.b, this.output);
    }

    public allCodes(): Instruction[] {
        return codeList.map((code) => this.setCode(code));
    }
}
class Machine {
    constructor(public registers = [0, 0, 0, 0]) {
    }

    public sameAs(other: Machine): boolean {
        return [0, 1, 2, 3].map((i) => this.registers[i] === other.registers[i]).reduce((acc, v) => acc && v, true);
    }

    public execute(instruction: Instruction): Machine {
        if (instruction.output < 0 || instruction.output > 3) {
            throw RangeError("Output outside of valid range");
        }
        return this.set(instruction.output, this.calculateValue(instruction));
    }

    private set(registerAddress: number, registerValue: number): Machine {
        const newRegisters = Array.from(this.registers);
        newRegisters[registerAddress] = registerValue;
        return new Machine(newRegisters);
    }

    private calculateValue(instruction: Instruction): number {
        function r(...ns: number[]) {
            for (const n of ns) {
                if (n < 0 || n > 3) {
                    throw RangeError("Register address out of range");
                }
            }
        }
        const i = instruction;
        function rab() {
            r(i.a, i.b);
        }
        function ra() {
            r(i.a);
        }
        function rb() {
            r(i.b);
        }
        switch (i.code) {
            case "addr":
                rab();
                return this.registers[i.a] + this.registers[i.b];
            case "addi":
                ra();
                return this.registers[i.a] + i.b;
            case "mulr":
                rab();
                return this.registers[i.a] * this.registers[i.b];
            case "muli":
                ra();
                return this.registers[i.a] * i.b;
            case "banr":
                rab();
                return this.registers[i.a] & this.registers[i.b];
            case "bani":
                ra();
                return this.registers[i.a] & this.registers[i.b];
            case "borr":
                rab();
                return this.registers[i.a] | this.registers[i.b];
            case "bori":
                ra();
                return this.registers[i.a] | this.registers[i.b];

            case "setr":
                ra();
                return this.registers[i.a];
            case "seti":
                return i.a;

            case "gtir":
                return i.a > this.registers[i.b] ? 1 : 0;
            case "gtri":
                return this.registers[i.a] > i.b ? 1 : 0;
            case "gtrr":
                return this.registers[i.a] > this.registers[i.b] ? 1 : 0;

            case "eqir":
                return i.a === this.registers[i.b] ? 1 : 0;
            case "eqri":
                return this.registers[i.a] === i.b ? 1 : 0;
            case "eqrr":
                return this.registers[i.a] === this.registers[i.b] ? 1 : 0;
            default:
                throw Error("Cannot execute instruction if no op code is given");

        }

    }
}

interface Calibration {
    before: Machine;
    after: Machine;
    instruction: Instruction;
}

export const entry = entryForFile(
    async ({ lines, outputCallback }) => {
        const { calibrationLines, puzzleLines } = parseLines(lines);
        const groupped = groupBy(calibrationLines, 3);
        function getList(l: string): number[] {
            return l.slice(l.indexOf("[") + 1, l.indexOf("]")).replace(/ /g, "").split(",").map((e) => parseInt(e, 10));
        }
        const calibrationTokens: Calibration[] = groupped.map((group) => {
            const encodedInstruction = group[1].split(" ").filter((e) => e.length >= 1).map((e) => parseInt(e, 10));
            return {
                before: new Machine(getList(group[0])),
                after: new Machine(getList(group[2])),
                instruction: new Instruction(
                    encodedInstruction[0],
                    encodedInstruction[1],
                    encodedInstruction[2],
                    encodedInstruction[3]
                )
            };
        });

        const result = calibrationTokens.map<number>((token) => {
            const validCodes = token.instruction.allCodes().map<number>((i) => {
                try {
                    if (token.before.execute(i).sameAs(token.after)) {
                        return 1;
                    } else {
                        return 0;
                    }
                } catch (RangeError) {
                    return 0;
                }
            }).reduce((acc, v) => acc + v, 0);
            if (validCodes >= 3) {
                return 1;
            } else {
                return 0;
            }
        }).reduce((acc, v) => acc + v, 0);
        await outputCallback("Ambigous instructions: " + result);
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    }
);

function parseLines(lines: string[]) {
    let calibrationLines: string[];
    let puzzleLines: string[];
    (() => {
        const complete = lines.map((l) => l.trim()).join("\n");
        const splitLine = complete.indexOf("\n\n\n");
        calibrationLines = complete.slice(0, splitLine + 1).split("\n").filter((l) => l.trim().length >= 1);
        puzzleLines = complete.slice(splitLine + 4).split("\n");
    })();
    return { calibrationLines, puzzleLines };
}
