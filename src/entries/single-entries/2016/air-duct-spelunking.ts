import { Queue } from '../../../support/data-structure';
import { Coordinate, getSurrounding, manhattanDistance } from '../../../support/geometry';
import { FixedSizeMatrix } from '../../../support/matrix';
import { entryForFile } from "../../entry";

type Target = {
    type: string;
    position: Coordinate;
}

const parseLines = (lines: string[]): { field: FixedSizeMatrix<"#" | ".">; startPosition: Coordinate; targets: Target[] } => {
    const size = {x: lines[0].length, y: lines.length};
    const field = new FixedSizeMatrix<"#" | ".">(size);
    let startPosition: Coordinate | undefined;
    const targets: Target[] = [];
    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            const cell = lines[y][x];
            if (cell === "." || cell === "#") {
                field.set({x,y}, cell);
            } else if (cell === "0") {
                startPosition = {x,y};
                field.set({x,y}, ".");
            } else {
                targets.push({type: cell, position: {x,y}});
                field.set({x,y}, ".");
            }
        }
    }
    if (!startPosition) {
        throw new Error("Start position not found");
    }
    return {field, startPosition, targets};
}

type QueueElement = {currentPosition: Coordinate, reachedTargets: string[], steps: number};

const serializeState = (state: QueueElement) => `${state.currentPosition.x}.${state.currentPosition.y}|${state.reachedTargets.join(".")}`;

export const airDuctSpelunking = entryForFile(
    async ({ lines, outputCallback }) => {
        const {field, startPosition, targets} = parseLines(lines);

        const outputField = new FixedSizeMatrix<"#" | "." | "+">(field.size);
        await field.onEveryCell((e, c) => outputField.set(e, c));

        const visitedStates = new Set<string>();
        const queue = new Queue<QueueElement>();
        const start: QueueElement = {currentPosition: startPosition, reachedTargets: [], steps: 0};
        queue.add(start);
        visitedStates.add(serializeState(start));
        let bestReached = 0;
        while (true) {
            const current = queue.get();
            if (!current) {
                // await outputCallback("Failed");
                // await outputCallback(outputField.toString(e => e || " "));
                return;
            }
            outputField.set(current.currentPosition, "+");
            for (const candidate of getSurrounding(current.currentPosition)) {
                const nextCell = field.get(candidate);
                if (!nextCell || nextCell === "#") {
                    continue;
                }
                const newSteps = current.steps + 1;
                const newReached = [...current.reachedTargets];
                const matchingTarget = targets.find(e => manhattanDistance(e.position, candidate) === 0);
                if (matchingTarget && !newReached.includes(matchingTarget.type)) {
                    newReached.push(matchingTarget.type);
                    if (newReached.length === targets.length) {
                        await outputCallback("And here we are!");
                        await outputCallback(newSteps);
                        return;
                    }
                    newReached.sort();
                }
                const queueElement: QueueElement = {currentPosition: candidate, reachedTargets: newReached, steps: newSteps};
                const state = serializeState(queueElement);
                if (visitedStates.has(state)) {
                    continue;
                }
                visitedStates.add(state);
                if (newReached.length > bestReached) {
                    await outputCallback("New best: " + newReached.length);
                    bestReached = newReached.length;
                }
                queue.add(queueElement);
            }
        }

    },
    async ({ lines, outputCallback }) => {
        const {field, startPosition, targets} = parseLines(lines);

        const outputField = new FixedSizeMatrix<"#" | "." | "+">(field.size);
        await field.onEveryCell((e, c) => outputField.set(e, c));

        const visitedStates = new Set<string>();
        const queue = new Queue<QueueElement>();
        const start: QueueElement = {currentPosition: startPosition, reachedTargets: [], steps: 0};
        queue.add(start);
        visitedStates.add(serializeState(start));
        let bestReached = 0;
        while (true) {
            const current = queue.get();
            if (!current) {
                await outputCallback("Failed");
                return;
            }
            outputField.set(current.currentPosition, "+");
            for (const candidate of getSurrounding(current.currentPosition)) {
                const nextCell = field.get(candidate);
                if (!nextCell || nextCell === "#") {
                    continue;
                }
                const newSteps = current.steps + 1;
                const newReached = [...current.reachedTargets];
                const matchingTarget = targets.find(e => manhattanDistance(e.position, candidate) === 0);
                if (matchingTarget && !newReached.includes(matchingTarget.type)) {
                    newReached.push(matchingTarget.type);
                    newReached.sort();
                }
                if (newReached.length === targets.length) {
                    if (manhattanDistance(candidate, startPosition) === 0) {
                        await outputCallback("And here we are!");
                        await outputCallback(newSteps);
                        return;
                    }
                }
                const queueElement: QueueElement = {currentPosition: candidate, reachedTargets: newReached, steps: newSteps};
                const state = serializeState(queueElement);
                if (visitedStates.has(state)) {
                    continue;
                }
                visitedStates.add(state);
                if (newReached.length > bestReached) {
                    await outputCallback("New best: " + newReached.length);
                    bestReached = newReached.length;
                }
                queue.add(queueElement);
            }
        }
    },
    { key: "air-duct-spelunking", title: "Air Duct Spelunking", stars: 2}
);