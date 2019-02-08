import { entryForFile } from "../entry";
import { groupBy } from "../../support/sequences";

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

// "banr" | "bani" |
// "borr" | "bori" |
// "setr" | "seti" |
// "gtir" | "gtri" | "gtrr" |
// "eqir" | "eqri" | "eqrr";

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
                return this.registers[i.a] & i.b;
            case "borr":
                rab();
                return this.registers[i.a] | this.registers[i.b];
            case "bori":
                ra();
                return this.registers[i.a] | i.b;

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
        const testCreator = (i: OpCode, a: number, b: number, e: number) =>
            ({ i: new Instruction(i, a, b, 3), e });

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
            const validCodes = token.instruction.allCodes().map<number>((i) => {
                return isTokenValid(token, i) ? 1 : 0;
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
        const instructions = puzzleLines.map((line) => {
            const g = line.split(" ").map((l) => l.trim()).filter((l) => l.length > 0);
            const p = (s: string) => parseInt(s, 10);
            return new Instruction(mapping[p(line[0])], p(line[1]), p(line[2]), p(line[3]));
        });

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
        // const execute = (m: Machine, ins: Instruction[]): Machine => {
        //     if (ins.length === 0) {
        //         return m;
        //     } else {
        //         return execute(m.execute(ins[0]), ins.slice(1));
        //     }
        // };

        // await outputCallback("First register: " + execute(new Machine(), instructions));
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
