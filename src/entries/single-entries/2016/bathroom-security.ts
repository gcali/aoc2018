import { Bounds, CCoordinate, Coordinate, directions, isInBounds, manhattanDistance } from '../../../support/geometry';
import { entryForFile } from "../../entry";

type Dir = "U" | "L" | "R" | "D";

const parseLines = (lines: string[]): Dir[][] => {
    return lines.map(line => line.trim().split("").map(e => e as Dir));
}

const dirMap = (d: Dir): CCoordinate => {
    switch (d) {
        case "D":
            return directions.down;
        case "L":
            return directions.left;
        case "R":
            return directions.right;
        case "U":
            return directions.up;
        default:
            throw new Error("Unknown direction");
    }
}

const coordinateToNumber = (c: Coordinate): number => {
    return c.x+1 + ((c.y)*3);
};

const coordinateToStrange = (c: Coordinate): string => {
    const output = [
        [' ',' ','1'],
        [' ','2','3','4'],
        ['5','6','7','8','9'],
        [' ','A','B','C'],
        [' ',' ','D']
    ];
    return output[c.y][c.x];
};

export const bathroomSecurity = entryForFile(
    async ({ lines, outputCallback }) => {

        const bounds: Bounds = {
            topLeft: {x: 0, y: 0},
            size: {x: 3, y: 3}
        };

        let currentPosition = {x: 1, y: 1};

        const input = parseLines(lines);

        const result = input.map(line => {
            line.forEach(instruction => {
                const candidate = dirMap(instruction).sum(currentPosition);
                if (isInBounds(candidate, bounds)) {
                    currentPosition = candidate;
                }
            });
            return coordinateToNumber(currentPosition);
        });

        await outputCallback(result.join(""));

    },
    async ({ lines, outputCallback }) => {
        let currentPosition = {x: 0, y: 2};

        const input = parseLines(lines);

        const result = input.map(line => {
            line.forEach(instruction => {
                const candidate = dirMap(instruction).sum(currentPosition);
                if (manhattanDistance(candidate, {x: 2, y: 2}) <= 2) {
                    currentPosition = candidate;
                }
            });
            return coordinateToStrange(currentPosition);
        });

        await outputCallback(result.join(""));
    },
    { key: "bathroom-security", title: "Bathroom Security", stars: 2}
);