
type Memory = number[];

interface Operation {
    code: number,
    immediateModes: boolean[],
    parameters: number
}

const parameterMap: { [key: number]: number } = {
    1: 3,
    2: 3,
    3: 1,
    4: 1
};

function parseOperation(op: number): Operation {
    const code = op % 100;
    const parameters = parameterMap[code];
    let modes = Math.floor(op / 100);
    const immediateModes = [];
    while (modes > 0) {
        const isImmediate = (modes % 10) === 1;
        immediateModes.push(isImmediate);
        modes = Math.floor(modes / 10);
    }
    let missing = parameters - immediateModes.length;
    while (missing > 0) {
        immediateModes.push(false);
        missing--;
    }
    return {
        code,
        immediateModes,
        parameters
    };
}

async function executeInstruction(pointer: number, memory: Memory, input: () => Promise<number>, output: (x: number) => void): Promise<[number, Memory]> {
    const copy = [...memory];
    const op = memory[pointer];
    const operation = parseOperation(op);
    if (operationExecutorMap[operation.code]) {
        const newPointer = await operationExecutorMap[operation.code](operation, pointer, copy, input, output);
        return [newPointer, copy];
    }
    else {
        throw Error("Operation not valid: " + operation.code);
    }
};

export function inputGenerator(inputList: number[]) {
    let i = 0;
    return async () => {
        if (i > inputList.length) {
            throw new Error("Input is empty");
        }
        return inputList[i++];
    };
}

interface ExecutionArgs {
    memory: Memory
    input: () => Promise<number>
    output: (x: number) => void,
    close?: () => void
}

export async function execute({ memory, input, output, close }: ExecutionArgs): Promise<Memory> {
    let instructionPointer = 0;
    while ((memory[instructionPointer] % 100) !== 99) {
        [instructionPointer, memory] = await executeInstruction(instructionPointer, memory, input, output);
    }
    if (close) {
        close();
    }
    return memory;
}

export function parseMemory(line: string): Memory {
    const memory = line.split(",").map(e => parseInt(e, 10));
    return memory;
}

function getParameter(address: number, memory: Memory, isImmediate: boolean): number {
    if (isImmediate) {
        return memory[address];
    }
    else {
        return memory[memory[address]];
    }
}

type OperationExecutor = (operation: Operation, instructionPointer: number, memory: Memory, input: () => Promise<number>, output: (x: number) => void) => Promise<number>;


const operationExecutorMap: { [key: number]: OperationExecutor } = {
    1: async (operation, instructionPointer, memory) => {
        const firstParameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        const secondParameter = getParameter(instructionPointer + 2, memory, operation.immediateModes[1]);
        memory[memory[instructionPointer + 3]] = firstParameter + secondParameter;
        return instructionPointer + operation.parameters + 1;
    },
    2: async (operation, instructionPointer, memory) => {
        const firstParameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        const secondParameter = getParameter(instructionPointer + 2, memory, operation.immediateModes[1]);
        memory[memory[instructionPointer + 3]] = firstParameter * secondParameter;
        return instructionPointer + operation.parameters + 1;
    },
    3: async (operation, instructionPointer, memory, input) => {
        memory[memory[instructionPointer + 1]] = await input();
        return instructionPointer + operation.parameters + 1;
    },
    4: async (operation, instructionPointer, memory, input, output) => {
        const parameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        output(parameter);
        return instructionPointer + operation.parameters + 1;
    },
    5: async (operation, instructionPointer, memory, input, output) => {
        const parameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        if (parameter !== 0) {
            const ret = getParameter(instructionPointer + 2, memory, operation.immediateModes[1]);
            return ret;
        }
        else {
            return instructionPointer + 3;
        }
    },
    6: async (operation, instructionPointer, memory, input, output) => {
        const parameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        if (parameter === 0) {
            const ret = getParameter(instructionPointer + 2, memory, operation.immediateModes[1]);
            return ret;
        }
        else {
            return instructionPointer + 3;
        }
    },
    7: async (operation, instructionPointer, memory, input, output) => {
        const firstParameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        const secondParameter = getParameter(instructionPointer + 2, memory, operation.immediateModes[1]);
        let result: number = 0;
        if (firstParameter < secondParameter) {
            result = 1;
        }
        memory[memory[instructionPointer + 3]] = result;
        return instructionPointer + 4;
    },
    8: async (operation, instructionPointer, memory, input, output) => {
        const firstParameter = getParameter(instructionPointer + 1, memory, operation.immediateModes[0]);
        const secondParameter = getParameter(instructionPointer + 2, memory, operation.immediateModes[1]);
        let result: number = 0;
        if (firstParameter === secondParameter) {
            result = 1;
        }
        memory[memory[instructionPointer + 3]] = result;
        return instructionPointer + 4;
    }
}
