import { entryForFile } from "../../entry";

type State = number[];

const serializeState = (state: State): string => {
    return JSON.stringify(state);
};

const shiftIndex = <T>(array: T[], index: number, delta: number): number => {
    return (index + delta) % array.length;
};

const distribute = (state: State, maxIndex: number, maxValue: number): State => {
    const newState = [...state];
    newState[maxIndex] = 0;
    let toDistribute = maxValue;
    let nextIndex = shiftIndex(state, maxIndex, 1);
    while (toDistribute > 0) {
        newState[nextIndex]++;
        nextIndex = shiftIndex(state, nextIndex, 1);
        toDistribute--;
    }
    return newState;
};

export const memoryReallocation = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        let state = lines[0].split("\t").map((e) => parseInt(e, 10));
        const createdStates = new Set<string>();
        while (true) {
            const maxValue = state.reduce((acc, next) => Math.max(acc, next));
            const maxIndex = state.indexOf(maxValue);
            state = distribute(state, maxIndex, maxValue);
            const serialization = serializeState(state);
            if (createdStates.has(serialization)) {
                break;
            }
            createdStates.add(serialization);
        }
        await outputCallback(createdStates.size + 1);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        let state = lines[0].split("\t").map((e) => parseInt(e, 10));
        const createdStates = new Map<string, number>();
        let lastSerialization: string | null = null;
        while (true) {
            const maxValue = state.reduce((acc, next) => Math.max(acc, next));
            const maxIndex = state.indexOf(maxValue);
            state = distribute(state, maxIndex, maxValue);
            const serialization = serializeState(state);
            if (createdStates.has(serialization)) {
                lastSerialization = serialization;
                break;
            }
            createdStates.set(serialization, createdStates.size + 1);
        }
        await outputCallback((createdStates.size + 1) - createdStates.get(lastSerialization)!);
    },
    { key: "memory-reallocation", title: "Memory Reallocation", stars: 2, }
);

