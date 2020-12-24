import { CircularDoubleLinkedNode } from "../../../../support/data-structure";
import { TimeCalculator } from "../../../../support/time";
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
        const state = parseLines(lines);
        const size = 1000000;
        fillUp(state, size);
        const moves = 10000000;
        const calculator = new TimeCalculator();
        calculator.start();
        for (let i = 0; i < moves; i++) {
            move(state);
            if (i % 1000 === 0 && i > 0) {
                const ratio = i / moves;
                await outputCallback(calculator.getExpectedSerialized(ratio), true);
            }
        }
        let cup = state.cups;
        while (cup.value !== 1) {
            cup = cup.next;
        }
        await outputCallback(cup.next.value);
        await outputCallback(cup.next.next.value);
        await resultOutputCallback(cup.next.value * cup.next.next.value);
    },
    {
        key: "crab-cups",
        title: "Crab Cups",
        supportsQuickRunning: true,
        embeddedData: true
    }
);
