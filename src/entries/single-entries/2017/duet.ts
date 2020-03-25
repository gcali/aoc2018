import { entryForFile } from "../../entry";
import { Queue } from '../../../support/data-structure';

type Command = "snd" | "set" | "add" | "mul" | "mod" | "rcv" | "jgz";

interface Instruction {
    command: Command;
    args: string[];
}

const parseLines = (lines: string[]): Instruction[] => {
    return lines.map(line => line.trim().split(" ")).map(tokens => {
        return {
            command: tokens[0] as Command,
            args: tokens.slice(1)
        };
    });
}

type SoundCallback = (frequency: number) => void;
type RecoverCallback = (() => void) | ReceiveCallback;
type ReceiveCallback = {receive: () => number | void};

function isReceive(e: RecoverCallback): e is ReceiveCallback {
    return (<ReceiveCallback>e).receive !== undefined;
}

type Registers = Map<string, number>;

const registerFactory = (): Registers => {
    const map = new Map<string, number>();
    [...Array('z'.charCodeAt(0) - 'a'.charCodeAt(0) + 1).keys()]
        .map(index => String.fromCharCode('a'.charCodeAt(0) + index))
        .forEach(e => map.set(e, 0));
    return map;
}

const getConstantOrRegister = (e: string, registers: Registers): number => {
    if (registers.has(e)) {
        return registers.get(e)!;
    }
    const value = parseInt(e, 10);
    if (value.toString() === e) {
        return value;
    }
    throw new Error("Invalid value: " + e);
}

interface Callbacks {
    soundCallback: SoundCallback,
    recoverCallback: RecoverCallback
}

const executeInstruction = (
    instruction: Instruction,
    currentIndex: number,
    registers: Registers,
    callbacks: Callbacks
)
    : [number, Registers] =>{
        const increasedIndex = currentIndex + 1;
        const args = instruction.args;
        const gcr = (index: number) => getConstantOrRegister(args[index], registers);
        switch (instruction.command) {
            case "add":
                registers.set(args[0], gcr(0) + gcr(1));
                break;
            case "jgz":
                if (gcr(0) > 0) {
                    return [currentIndex + gcr(1), registers];
                }
                break;
            case "mod":
                registers.set(args[0], gcr(0) % gcr(1));
                break;
            case "mul":
                registers.set(args[0], gcr(0) * gcr(1));
                break;
            case "rcv":
                if (isReceive(callbacks.recoverCallback)) {
                    const result = callbacks.recoverCallback.receive();
                    if (result !== undefined) {
                        registers.set(args[0], result);
                    } else {
                        return [currentIndex, registers];
                    }
                } else if (gcr(0) !== 0) {
                    callbacks.recoverCallback();
                }
                break;
            case "set":
                registers.set(args[0], gcr(1));
                break;
            case "snd":
                callbacks.soundCallback(gcr(0)); 
                break;
            default:
                throw new Error("Could not execute instruction '" + instruction.command + "'");
        }
        return [increasedIndex, registers];
}

export const duet = entryForFile(
    async ({ lines, outputCallback }) => {
        const instructions = parseLines(lines);
        let currentIndex = 0;
        let registers = registerFactory();
        let lastSound = 0;
        let hasRecovered = false;
        while (currentIndex >= 0 && currentIndex < instructions.length && !hasRecovered) {
            const instruction = instructions[currentIndex];
            [currentIndex, registers] = executeInstruction(
                instruction,
                currentIndex,
                registers,
                {
                    soundCallback: sound => lastSound = sound,
                    recoverCallback: () => hasRecovered = true
                }
            );
        }
        await outputCallback({hasRecovered, lastSound});
    },
    async ({ lines, outputCallback }) => {
        const instructions = parseLines(lines);
        let aIndex = 0;
        let bIndex = 0;
        let aRegisters = registerFactory();
        let bRegisters = registerFactory();
        bRegisters.set("p", 1);
        let a2bPipe: Queue<number> = new Queue<number>();
        let b2aPipe: Queue<number> = new Queue<number>();
        let isAWaiting = false;
        let isBWaiting = false;
        let hasAEnded = false;
        let hasBEnded = false;

        let counter = 0;

        while (!hasAEnded || !hasBEnded) {
            if (!hasAEnded) {
                [aIndex, aRegisters] = executeInstruction(
                    instructions[aIndex],
                    aIndex,
                    aRegisters,
                    {
                        soundCallback: (n: number) => a2bPipe.add(n),
                        recoverCallback: {receive: () => {
                            isAWaiting = true;
                            if (!b2aPipe.isEmpty) {
                                isAWaiting = false;
                                return b2aPipe.get()!;
                            }
                        }}
                    }
                );
            }
            if (!hasBEnded) {
                [bIndex, bRegisters] = executeInstruction(
                    instructions[bIndex],
                    bIndex,
                    bRegisters,
                    {
                        soundCallback: (n: number) => {
                            b2aPipe.add(n);
                            counter++;
                        },
                        recoverCallback: {receive: () => {
                            isBWaiting = true;
                            if (!a2bPipe.isEmpty) {
                                isBWaiting = false;
                                return a2bPipe.get()!;
                            }
                        }}
                    }
                );
            }
            if ((isAWaiting || hasAEnded) && (isBWaiting || hasBEnded)) {
                hasAEnded = true;
                hasBEnded = true;
            }
            if (aIndex < 0 || aIndex >= instructions.length) {
                hasAEnded = true;
            }
            if (bIndex < 0 || bIndex >= instructions.length) {
                hasBEnded = true;
            }
        }
        await outputCallback(counter);
    }
);