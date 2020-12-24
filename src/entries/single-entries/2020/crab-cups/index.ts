import { CircularDoubleLinkedNode } from "../../../../support/data-structure";
import { entryForFile } from "../../../entry";

type GameState = {
    cups: CircularDoubleLinkedNode<number>;
    length: number;
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
    let destinationCup = state.cups;
    while (destinationCup.value !== destination) {
        destinationCup = destinationCup.next!;
    }
    for (const toPut of pickedUp) {
        destinationCup = destinationCup.append(toPut);
    }
    state.cups = state.cups.next!;
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
        length: cups.length
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
};

const range = (start: number, end: number) => {
    return Array(end - start + 1).fill(0).map((_, idx) => start + idx);
};


const crabcups = (labels: string, moves= 100, cupcount= 9) => {
    // next will store the next cup, it will also be filled such that next[i] = i+1;
    const next = range(1, cupcount + 1);
    // cups[] stores each cup value
    const cups = labels.split("").map((i) => parseInt(i, 10));
    next[0] = next[next.length - 1] = cups[0];
    for (let x = 0; x < cups.length - 1; x++) {
        // here the cup value is used as the index, it points to the cup next to the current cup
        next[cups[x]] = cups[x + 1];
    }
    // since our next array is filled with 1->cupcount the last value we care to set is the last
    // cups next value, which will be 1+the max of cups
    next[cups[cups.length - 1]] = Math.max(...cups) + 1;
    let cur = 0;

    for (let c = 0; c <= moves; c++) {
        // this is defined abouve as the first cup, next[0] = cups[0]
        cur = next[cur];
        let ins = cur !== 1 ? cur - 1 : cupcount;
        const p1 = next[cur];
        const p2 = next[p1];
        const p3 = next[p2];

        while (ins === p1 || ins === p2 || ins === p3) {
            ins -= 1;
        }
        if (ins < 1) {
            ins += cupcount;
        }

        [next[p3], next[ins], next[cur]] = [next[ins], next[cur], next[p3]];
    }
    return next[1] * next[next[1]];
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
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const size = 1000000;
        const moves = 10000000;
        await resultOutputCallback(crabcups(lines[0], moves, size));
    },
    {
        key: "crab-cups",
        title: "Crab Cups",
        supportsQuickRunning: true,
        embeddedData: true
    }
);
