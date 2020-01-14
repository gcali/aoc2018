import { entryForFile } from "../../entry";
import { groupBy } from "../../../support/sequences";

export type OpCode =
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

export class Instruction {

    public static fromLines(lines: string[], mapping: (s: string) => OpCode): Instruction[] {
        lines = lines.map((l) => l.replace(/\/\/.*/g, ""));
        const instructions = lines.map((line) => {
            let g = line.split(" ").map((l) => l.trim()).filter((l) => l.length > 0);
            if (g.length < 4) {
                g = g.fill("0", g.length, 4);
            }
            const p = (s: string) => parseInt(s, 10);
            return new Instruction(mapping(g[0]), p(g[1]), p(g[2]), p(g[3]));
        });
        return instructions;
    }
    constructor(public code: OpCode | number, public a: number, public b: number, public output: number) {
    }

    public setCode(code: OpCode): Instruction {
        return new Instruction(code, this.a, this.b, this.output);
    }

    public allCodes(): Instruction[] {
        return codeList.map((code) => this.setCode(code));
    }

    public toString() {
        return `${this.code} ${this.a} ${this.b} ${this.output}`;
    }
}

export class Machine {
    constructor(public registers = [0, 0, 0, 0], public instructionPointerRegister?: number) {
    }

    public sameAs(other: Machine): boolean {
        if (this.registers.length !== other.registers.length) {
            return false;
        }
        return this.registers
            .map((e, i) => this.registers[i] === other.registers[i])
            .reduce((acc, v) => acc && v, true);
    }

    public get nextInstructionAddress(): number {
        if (this.instructionPointerRegister === undefined) {
            return 0;
        } else {
            return this.registers[this.instructionPointerRegister];
        }
    }

    public isExecutable(instructionRange: number): boolean {
        if (this.instructionPointerRegister === undefined) {
            return true;
        } else {
            const newI = this.nextInstructionAddress;
            return newI >= 0 && newI < instructionRange;
        }
    }


    public execute(instruction: Instruction): Machine {
        if (instruction.output < 0 || instruction.output > this.registers.length) {
            throw RangeError("Output outside of valid range");
        }
        const calculatedValue = this.calculateValue(instruction);
        return this.set(
            instruction.output,
            calculatedValue
        );
    }

    private set(registerAddress: number, value: number): Machine {
        const newRegisters = Array.from(this.registers);
        newRegisters[registerAddress] = value;
        if (this.instructionPointerRegister !== undefined) {
            newRegisters[this.instructionPointerRegister]++;
        }
        return new Machine(newRegisters, this.instructionPointerRegister);
    }

    private calculateValue(instruction: Instruction): number {
        const r = (...ns: number[]) => {
            for (const n of ns) {
                if (n < 0 || n > this.registers.length) {
                    throw RangeError("Register address out of range");
                }
            }
        };
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

        const existing = (n: number): number => n;

        switch (i.code) {
            case "addr":
                rab();
                return existing(this.registers[i.a] + this.registers[i.b]);
            case "addi":
                ra();
                return existing(this.registers[i.a] + i.b);
            case "mulr":
                rab();
                return existing(this.registers[i.a] * this.registers[i.b]);
            case "muli":
                ra();
                return existing(this.registers[i.a] * i.b);
            case "banr":
                rab();
                return existing(this.registers[i.a] & this.registers[i.b]);
            case "bani":
                ra();
                return existing(this.registers[i.a] & i.b);
            case "borr":
                rab();
                return existing(this.registers[i.a] | this.registers[i.b]);
            case "bori":
                ra();
                return existing(this.registers[i.a] | i.b);

            case "setr":
                ra();
                return existing(this.registers[i.a]);
            case "seti":
                return existing(i.a);

            case "gtir":
                return existing(i.a > this.registers[i.b] ? 1 : 0);
            case "gtri":
                return existing(this.registers[i.a] > i.b ? 1 : 0);
            case "gtrr":
                return existing(this.registers[i.a] > this.registers[i.b] ? 1 : 0);

            case "eqir":
                return existing(i.a === this.registers[i.b] ? 1 : 0);
            case "eqri":
                return existing(this.registers[i.a] === i.b ? 1 : 0);
            case "eqrr":
                return existing(this.registers[i.a] === this.registers[i.b] ? 1 : 0);
            default:
                throw RangeError("Cannot execute instruction if no op code is given");

        }

    }
}

interface Calibration {
    before: Machine;
    after: Machine;
    instruction: Instruction;
}

const isTokenValid = (token: Calibration, i: Instruction): boolean => {
    try {
        if (token.before.execute(i).sameAs(token.after)) {
            return true;
        } else {
            return false;
        }
    } catch (RangeError) {
        return true;
    }
};


export const entry = entryForFile(
    async ({ lines, outputCallback }) => {
        const testMachineFactory = () => new Machine([0, 1, 2, 3]);
        const testCreator = (opCode: OpCode, a: number, b: number, e: number) =>
            ({ i: new Instruction(opCode, a, b, 3), e });

        const tests = [
            testCreator("addr", 0, 1, 1), // 0
            testCreator("addr", 0, 1, 1),
            testCreator("addr", 1, 1, 2),
            testCreator("addi", 1, 3, 4),
            testCreator("addi", 2, 4, 6),
            testCreator("mulr", 2, 0, 0), // 5
            testCreator("mulr", 2, 1, 2),
            testCreator("muli", 0, 6, 0),
            testCreator("muli", 2, 5, 10),
            testCreator("banr", 1, 2, 0),
            testCreator("bani", 1, 8, 0), // 10
            testCreator("banr", 1, 3, 1),
            testCreator("bani", 1, 9, 1),
            testCreator("borr", 1, 2, 3),
            testCreator("bori", 1, 8, 9),
            testCreator("setr", 1, 8, 1), // 15
            testCreator("setr", 2, 20, 2),
            testCreator("seti", 8, 0, 8),
            testCreator("gtir", 4, 2, 1),
            testCreator("gtir", 2, 2, 0),
            testCreator("gtri", 2, 1, 1),
            testCreator("gtri", 2, 3, 0),
            testCreator("gtri", 3, 8, 0),
            testCreator("gtrr", 3, 3, 0),
            testCreator("gtrr", 3, 2, 1),
            testCreator("eqir", 4, 2, 0),
            testCreator("eqir", 2, 2, 1),
            testCreator("eqri", 2, 1, 0),
            testCreator("eqri", 2, 3, 0),
            testCreator("eqri", 3, 8, 0),
            testCreator("eqrr", 3, 3, 1),
            testCreator("eqrr", 3, 2, 0)
        ];

        let i = 0;
        for (const test of tests) {
            const m = testMachineFactory();
            try {
                const r = m.execute(test.i);
                if (r.registers[3] !== test.e) {
                    await outputCallback(`Test ${i} failed`);
                }
            } catch (RangeError) {
                await outputCallback(`Test ${i} was out of range`);
            }
            i++;
        }
        const calibrationTokens: Calibration[] = parseCalibrationTokens(lines);
        const result = calibrationTokens.map<number>((token) => {
            const validCodes = token.instruction.allCodes().map<number>((instruction) => {
                return isTokenValid(token, instruction) ? 1 : 0;
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
        const calibrationTokens = parseCalibrationTokens(lines);
        const mapping: { [key: number]: OpCode } = {};
        let done: boolean = false;
        while (!done) {
            done = true;
            calibrationTokens.forEach((token) => {
                if (typeof token.instruction.code === "number") {
                    if (mapping[token.instruction.code]) {
                        token.instruction.code = mapping[token.instruction.code];
                    } else {
                        const toBeMapped = codeList.filter((e) => Object.values(mapping).indexOf(e) === -1);
                        const valid = toBeMapped.filter((code) =>
                            isTokenValid(token, token.instruction.setCode(code)));
                        if (valid.length === 0) {
                            throw new Error("No valid instruction");
                        } else if (valid.length === 1) {
                            done = false;
                            mapping[token.instruction.code] = valid[0];
                        }
                    }
                }
            });
        }
        await outputCallback("Calibration done");
        const puzzleLines = parseLines(lines).puzzleLines.filter((l) => l.trim().length > 0);
        const instructions = Instruction.fromLines(puzzleLines, ((s) => mapping[parseInt(s, 10)]));

        let m = new Machine();
        let ln = 0;
        for (const ins of instructions) {
            try {
                m = m.execute(ins);
            } catch (RangeError) {
                await outputCallback("Error on line " + ln);
                break;
            }
            ln++;
        }

        await outputCallback("First register: " + m.registers[0]);
    }
);

function parseCalibrationTokens(lines: string[]) {
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
    return calibrationTokens;
}

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
