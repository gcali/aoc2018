import { entryForFile } from "../../../entry";

type Instruction = {
    mask: string[];
} | {
    address: number;
    value: string;
};

const isMask = (e: Instruction): e is {mask: string[]} => {
    return (e as {mask: string[]}).mask !== undefined;
};

const parseLines = (lines: string[]): Instruction[] => {
    return lines.map((line) => {
        const [a, b] = line.split(" = ");
        if (a.includes("[")) {
            return {
                value: parseInt(b, 10).toString(2).padStart(36, "0"),
                address: parseInt(a.match(/.*\[(\d+)\]/)![1], 10)
            };
        } else {
            return {
                mask: b.split("")
            };
        }
    });
};

interface Memory {
    data: {[key: number]: number};
    mask: string[];
}

const emptyMemory = (): Memory => {
    return {
        data: {},
        mask: "".padStart(36, "X").split("")
    };
};

const updateMemory = async (instruction: Instruction, memory: Memory): Promise<void> => {
    if (isMask(instruction)) {
        memory.mask = instruction.mask;
    } else {
        memory.data[instruction.address] = parseInt(memory.mask.map((e, i) => {
            if (e === "X") {
                return instruction.value[i];
            } else {
                return e;
            }
        }).join(""), 2);
    }
};

const createAddress = (mask: string[], address: string, index: number): string[] => {
    if (index >= mask.length) {
        return [""];
    }
    let base = "";
    if (mask[index] === "0") {
        base = address[index];
    } else if (mask[index] === "1") {
        base = "1";
    } else {
        base = "X";
    }
    const remaining = createAddress(mask, address, index + 1);
    if (base === "X") {
         return remaining.flatMap((e) => ["0", "1"].map((x) => x + e));
    } else {
        return remaining.map((e) => base + e);
    }
};


const updateMemory2 = async (instruction: Instruction, memory: Memory): Promise<void> => {
    if (isMask(instruction)) {
        memory.mask = instruction.mask;
    } else {
        const binaryAddress = instruction.address.toString(2).padStart(36, "0");
        const addresses = createAddress(memory.mask, binaryAddress, 0);
        for (const address of addresses) {
            const v = parseInt(instruction.value, 2);
            memory.data[parseInt(address, 2)] = v;
        }
    }
};

export const dockingData = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        const memory = emptyMemory();
        for (const instruction of input) {
            updateMemory(instruction, memory);
        }
        const result = Object.values(memory.data).reduce((acc, next) => acc + next, 0);
        await resultOutputCallback(result);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        const memory = emptyMemory();
        for (const instruction of input) {
            updateMemory2(instruction, memory);
        }
        const result = Object.values(memory.data).reduce((acc, next) => acc + next, 0);
        await resultOutputCallback(result);
    },
    { key: "docking-data", title: "Docking Data", embeddedData: true, stars: 2}
);
