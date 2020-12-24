import { CircularDoubleLinkedNode } from "../../../../support/data-structure";
import { entryForFile } from "../../../entry";

type GameState = {
    cups: CircularDoubleLinkedNode<number>;
    length: number;
    map: {[key: number]: CircularDoubleLinkedNode<number>}
};

const serialize = (state: GameState): string => {
    return state.cups.getAllElements().join("");
};

const move = (state: GameState): void => {
    const currentCupLabel = state.cups.value;
    const pickedUp = [1, 2, 3].map((i) => state.cups.removeNext()!);
    let destination = (currentCupLabel - 1 + state.length - 1) % state.length + 1;
    while (pickedUp.includes(destination)) {
        destination = (destination - 1 + state.length - 1) % state.length + 1;
    }
    if (destination < 1 || destination > state.length) {
        throw new Error("Invalid destination: " + destination);
    }
    let destinationCup = state.map[destination];
    for (const toPut of pickedUp) {
        destinationCup = destinationCup.append(toPut);
        state.map[destinationCup.value] = destinationCup;
    }
    state.cups = state.cups.next!;
};

type Cup = CircularDoubleLinkedNode<number>;

const buildMap = (cups: Cup): {[key: number]: Cup} => {
    const start = cups;
    const map: {[key: number]: Cup} = {};
    let current = start;
    do {
        map[current.value] = current;
        current = current.next;
    } while (current !== start);
    return map;
};

const parseLines = (lines: string[]): GameState => {
    const cups = lines[0].split("").map((e) => parseInt(e, 10));
    const startCup = new CircularDoubleLinkedNode<number>(cups[0]);
    let current = startCup;
    for (const c of cups.slice(1)) {
        current = current.append(c);
    }
    return {
        cups: startCup,
        length: cups.length,
        map: buildMap(startCup)
    };
};

const createResult = (state: GameState): string => {
    let cup = state.cups;
    while (cup.value !== 1) {
        cup = cup.next;
    }
    return cup.getAllElements().join("").slice(1);
};

const fillUp = (state: GameState, upTo: number) => {
    for (let i = state.length; i < upTo; i++) {
        state.cups.prepend(i + 1);
    }
    state.length = upTo;
    state.map = buildMap(state.cups);
};

const range = (start: number, end: number) => {
    return Array(end - start + 1).fill(0).map((_, idx) => start + idx);
};


export const crabCups = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const state = parseLines(lines);
        for (let i = 0; i < 100; i++) {
            move(state);
        }
        await outputCallback(serialize(state));
        await resultOutputCallback(createResult(state));
    },
    async ({ lines, outputCallback, pause, resultOutputCallback }) => {
        const size = 1000000;
        const moves = 10000000;
        const state = parseLines(lines);
        fillUp(state, size);
        for (let i = 0; i < moves; i++) {
            move(state);
            if (i % 10000 === 0) {
                await pause();
            }
        }
        await resultOutputCallback(state.map[1].next.value * state.map[1].next.next.value);
    },
    {
        key: "crab-cups",
        title: "Crab Cups",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);
