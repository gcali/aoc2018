import { CCoordinate, directions, manhattanDistance, rotate } from '../../../support/geometry';
import { entryForFile } from "../../entry";

export const noTimeForATaxicab = entryForFile(
    async ({ lines, outputCallback }) => {
        let currentDirection = directions.up;
        const input = lines[0].split(", ").map(l => ({
            direction: l[0],
            steps: parseInt(l.slice(1))
        }));

        let currentCoordinates = new CCoordinate(0, 0);

        input.forEach(i => {
            if (i.direction === "L") {
                currentDirection = rotate(currentDirection, "Counterclockwise")
            } else {
                currentDirection = rotate(currentDirection, "Clockwise");
            }
            currentCoordinates = currentCoordinates.sum(currentDirection.times(i.steps));
        })

        await outputCallback(manhattanDistance(currentCoordinates, {x:0,y:0}));
    },
    async ({ lines, outputCallback }) => {
        let currentDirection = directions.up;
        const input = lines[0].split(", ").map(l => ({
            direction: l[0],
            steps: parseInt(l.slice(1))
        }));

        let currentCoordinates = new CCoordinate(0, 0);

        const visited: CCoordinate[] = [];

        visited.push(currentCoordinates);

        for (const i of input) {
            if (i.direction === "L") {
                currentDirection = rotate(currentDirection, "Counterclockwise")
            } else {
                currentDirection = rotate(currentDirection, "Clockwise");
            }
            for (let x = 0; x < i.steps; x++) {
                currentCoordinates = currentCoordinates.sum(currentDirection);
                if (visited.filter(e => manhattanDistance(e, currentCoordinates) === 0).length > 0) {
                    await outputCallback("Found it:")
                    await outputCallback(manhattanDistance(currentCoordinates, {x:0,y:0}));
                    return;
                }
                visited.push(currentCoordinates);
            }
        }

    },
    { key: "no-time-for-a-taxicab", title: "No Time for a Taxicab", stars: 2}
);