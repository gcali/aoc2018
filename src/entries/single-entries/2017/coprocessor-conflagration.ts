import { entryForFile } from "../../entry";
import { Queue } from "../../../support/data-structure";

// type Command = "snd" | "set" | "add" | "mul" | "mod" | "rcv" | "jgz";
type Command = "set" | "sub" | "mul" | "jnz";

interface Instruction {
    command: Command;
    args: string[];
}

const parseLines = (lines: string[]): Instruction[] => {
    return lines.map((line) => line.trim().split(" ")).map((tokens) => {
        return {
            command: tokens[0] as Command,
            args: tokens.slice(1)
        };
    });
};

// type SoundCallback = (frequency: number) => void;
// type RecoverCallback = (() => void) | ReceiveCallback;
// type ReceiveCallback = { receive: () => number | void };

// function isReceive(e: RecoverCallback): e is ReceiveCallback {
//     return (<ReceiveCallback>e).receive !== undefined;
// }

type Registers = Map<string, number>;

const registerFactory = (): Registers => {
    const map = new Map<string, number>();
    [...Array("z".charCodeAt(0) - "a".charCodeAt(0) + 1).keys()]
        .map((index) => String.fromCharCode("a".charCodeAt(0) + index))
        .forEach((e) => map.set(e, 0));
    return map;
};

const getConstantOrRegister = (e: string, registers: Registers): number => {
    if (registers.has(e)) {
        return registers.get(e)!;
    }
    const value = parseInt(e, 10);
    if (value.toString() === e) {
        return value;
    }
    throw new Error("Invalid value: " + e);
};

interface Callbacks {
    mulCallback?: () => void;
    // soundCallback: SoundCallback,
    // recoverCallback: RecoverCallback
}

const executeInstruction = (
    instruction: Instruction,
    currentIndex: number,
    registers: Registers,
    callbacks?: Callbacks
)
    : [number, Registers] => {
    const increasedIndex = currentIndex + 1;
    const args = instruction.args;
    const gcr = (index: number) => getConstantOrRegister(args[index], registers);
    switch (instruction.command) {
        case "sub":
            registers.set(args[0], gcr(0) - gcr(1));
            break;
        // case "add":
        //     registers.set(args[0], gcr(0) + gcr(1));
        //     break;
        // case "jgz":
        //     if (gcr(0) > 0) {
        //         return [currentIndex + gcr(1), registers];
        //     }
        //     break;
        case "jnz":
            if (gcr(0) !== 0) {
                return [currentIndex + gcr(1), registers];
            }
            break;
        // case "mod":
        //     registers.set(args[0], gcr(0) % gcr(1));
        //     break;
        case "mul":
            registers.set(args[0], gcr(0) * gcr(1));
            if (callbacks && callbacks.mulCallback) {
                callbacks.mulCallback();
            }
            break;
        // case "rcv":
        //     if (isReceive(callbacks.recoverCallback)) {
        //         const result = callbacks.recoverCallback.receive();
        //         if (result !== undefined) {
        //             registers.set(args[0], result);
        //         } else {
        //             return [currentIndex, registers];
        //         }
        //     } else if (gcr(0) !== 0) {
        //         callbacks.recoverCallback();
        //     }
        //     break;
        case "set":
            registers.set(args[0], gcr(1));
            break;
        // case "snd":
        //     callbacks.soundCallback(gcr(0));
        //     break;
        default:
            throw new Error("Could not execute instruction '" + instruction.command + "'");
    }
    return [increasedIndex, registers];
};

export const coprocessorConflagration = entryForFile(
    async ({ lines, outputCallback }) => {
        const instructions = parseLines(lines);
        let currentIndex = 0;
        let registers = registerFactory();
        let mulCount = 0;
        while (currentIndex >= 0 && currentIndex < instructions.length) {
            const instruction = instructions[currentIndex];
            [currentIndex, registers] = executeInstruction(
                instruction,
                currentIndex,
                registers,
                {
                    mulCallback: () => mulCount++
                }
            );
        }
        await outputCallback(mulCount);
    },
    async ({ lines, outputCallback }) => {
        // disassembled:
        // let b = (81 * 100) + 100000;
        // let c = b + 17000
        // //semantic
        // let h = 0;
        // //let b = 108100;
        // //let c = b + 17000;
        // while (b !== c + 17) {
        //     if (!isPrime(b)) {
        //         h++;
        //     }
        //     b += 17;
        // }

        const isPrime = (e: number) => {
            for (let i = 2; i * i <= e; i++) {
                if (e % i === 0) {
                    return false;
                }
            }
            return true;
        };
        let b = (81 * 100) + 100000;
        const c = b + 17000;
        let h = 0;
        while (b !== c + 17) {
            if (!isPrime(b)) {
                h++;
            }
            b += 17;
        }

        await outputCallback(h);
    },
    { key: "coprocessor-conflagration", title: "Coprocessor Conflagration", stars: 2, }
);
