import { buildGroupsFromSeparator } from "../../../../support/sequences";
import { entryForFile } from "../../../entry";

type Deck = number[];

type GameState = {
    a: Deck;
    b: Deck;
};

const serializeState = (state: GameState): string => {
    return JSON.stringify(state);
};

const parseLines = (lines: string[]): GameState => {
    const decks: Deck[] = [];
    for (const group of buildGroupsFromSeparator(lines, (e) => !e)) {
        decks.push(group.slice(1).map((e) => parseInt(e, 10)));
    }
    return {
        a: decks[0],
        b: decks[1]
    };
};

const winRecursiveRound = (gameState: GameState): keyof GameState => {
    // console.log("=== Game " + level + " ===");
    const memo = new Set<string>();
    while (true) {
        const result = playRecursiveRound(gameState, memo);
        if (result) {
            return result;
        }
    }
};

let level = 1;

const playRecursiveRound = (gameState: GameState, memo: Set<string>): false | keyof GameState => {
    if (memo.has(serializeState(gameState))) {
        return "a";
    }
    memo.add(serializeState(gameState));
    if (gameState.a.length === 0) {
        return "b";
    } else if (gameState.b.length === 0) {
        return "a";
    }
    const firstA = gameState.a.shift()!;
    const firstB = gameState.b.shift()!;
    if (gameState.a.length >= firstA && gameState.b.length >= firstB) {
        const nestedState: GameState = {
            a: gameState.a.slice(0, firstA),
            b: gameState.b.slice(0, firstB)
        };
        level++;
        const winner = winRecursiveRound(nestedState);
        level--;
        if (winner === "a") {
            gameState.a.push(firstA);
            gameState.a.push(firstB);
        } else {
            gameState.b.push(firstB);
            gameState.b.push(firstA);
        }
        return false;
    } else {
        const winner = firstA > firstB ? gameState.a : gameState.b;
        if (firstA > firstB) {
            winner.push(firstA);
        }
        winner.push(firstB);
        if (firstA < firstB) {
            winner.push(firstA);
        }
        if (gameState.a.length === 0) {
            return "b";
        } else if (gameState.b.length === 0) {
            return "a";
        } else {
            return false;
        }
    }
};

const playRound = (gameState: GameState): false | keyof GameState => {
    if (gameState.a.length === 0) {
        return "b";
    } else if (gameState.b.length === 0) {
        return "a";
    }
    const firstA = gameState.a.shift()!;
    const firstB = gameState.b.shift()!;
    const winner = firstA > firstB ? gameState.a : gameState.b;
    if (firstA > firstB) {
        winner.push(firstA);
    }
    winner.push(firstB);
    if (firstA < firstB) {
        winner.push(firstA);
    }
    if (gameState.a.length === 0) {
        return "b";
    } else if (gameState.b.length === 0) {
        return "a";
    } else {
        return false;
    }
};

const calculateScore  = (deck: Deck): number =>
    [...deck.reverse()]
        .map((e, i) => e * (i + 1))
        .reduce((acc, next) => acc + next, 0);

export const crabCombat = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback, setAutoStop, pause }) => {
        setAutoStop();
        const state = parseLines(lines);
        while (true) {
            const result = playRound(state);
            await pause();
            await outputCallback(state.a.length, true);
            if (result) {
                const winnerDeck = state[result];
                await resultOutputCallback(calculateScore(winnerDeck));
                return;
            }
        }
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const state = parseLines(lines);
        const winner = winRecursiveRound(state);
        await resultOutputCallback(calculateScore(state[winner]));
    },
    {
        key: "crab-combat",
        title: "Crab Combat",
        embeddedData: true,
        supportsQuickRunning: true,
        suggestedDelay: 0,
        customComponent: "pause-and-run"
    }
);
