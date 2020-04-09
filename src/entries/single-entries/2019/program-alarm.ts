import { entryForFile } from "../../entry";

const parse = (lines: string[]) => {
    const joined = lines.join("").split(",");
    return joined.map((e) => parseInt(e, 10));
};

function handleSum(instructionPointer: number, memory: number[]): [number, number[]] {
    return handleCode(instructionPointer, (a, b) => a + b, memory);
}

function handleMult(instructionPointer: number, memory: number[]): [number, number[]] {
    return handleCode(instructionPointer, (a, b) => a * b, memory);
}

function handleCode(
    instructionPointer: number,
    aggregator: ((a: number, b: number) => number),
    memory: number[]
): [number, number[]] {
    const firstParameter = memory[memory[instructionPointer + 1]];
    const secondParameter = memory[memory[instructionPointer + 2]];
    const storageAddress = memory[instructionPointer + 3];
    memory = [...memory];
    memory[storageAddress] = aggregator(firstParameter, secondParameter);
    return iterate(instructionPointer + 4, memory);
}

function iterate(instructionPointer: number, memory: number[]): [number, number[]] {
    const code = memory[instructionPointer];
    switch (code) {
        case 99:
            return [instructionPointer, memory];
        case 1:
            return handleSum(instructionPointer, memory);
        case 2:
            return handleMult(instructionPointer, memory);
        default:
            throw Error("Code " + code + " not valid");
    }
}

export const programAlarm = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parse(lines);
        const [_, result] = iterate(0, memory);
        await outputCallback(`Result: ${result[0]}`);
        // const requirement = lines
        //     .map(line => parseInt(line, 10))
        //     .map(fuelCalculator)
        //     .reduce((acc, next) => acc + next, 0);

        // await outputCallback(`Result: ${requirement}`);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parse(lines);
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                memory[1] = i;
                memory[2] = j;
                try {
                    const [_, result] = iterate(0, memory);
                    if (result[0] === 19690720) {
                        await outputCallback(`Result: ${i}${j < 10 ? "0" : ""}${j}`);
                        return;
                    }

                } catch { }
            }
        }
    },
    { key: "program-alarm", title: "1202 Program Alarm", stars: 2, }
);
