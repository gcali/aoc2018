import { entryForFile } from "../../entry";
import { UlamCalculator } from "../../../support/ulam";
import { manhattanDistance, directions, getSurrounding, getFullSurrounding } from "../../../support/geometry";
import { UnknownSizeField } from "../../../support/field";

function parseLines(lines: string[]): number[][] {
    return lines
        .map((l) => l.trim())
        .map((line) => line.split("\t").map((token) => parseInt(token, 10)))
    ;
}

export const spiralMemory = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const squareValue = parseInt(lines[0], 10);
        const calculator = new UlamCalculator();
        const coordinates = calculator.getCoordinatesFromValue(squareValue);
        const distance = manhattanDistance({x: 0, y: 0}, coordinates);
        await outputCallback(distance);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const target = parseInt(lines[0], 10);
        const field = new UnknownSizeField<number>();

        let next = 1;
        let toDo = next;
        let nextIteration = 2;
        const directionOrder = [
            directions.right,
            directions.up,
            directions.left,
            directions.down
        ];
        let currentDirection = 0;

        field.set({x: 0, y: 0}, 1);
        let currentPosition = {x: 0, y: 0};
        const i = 0;
        while (true) {
            currentPosition = directionOrder[currentDirection].sum(currentPosition);
            const value = getFullSurrounding(currentPosition).map((c) => field.get(c)).filter((e) => e !== null).reduce((acc: number, next) => acc + next!, 0);
            if (value > target) {
                await outputCallback(value);
                return;
            }
            field.set(currentPosition, value);
            toDo--;
            if (toDo === 0) {
                nextIteration--;
                currentDirection = (currentDirection + 1) % directionOrder.length;
                if (nextIteration > 0) {
                    toDo = next;
                } else {
                    nextIteration = 2;
                    next++;
                    toDo = next;
                }
            }
        }
    },
    { key: "spiral-memory", title: "Spiral Memory", stars: 2, }
);

