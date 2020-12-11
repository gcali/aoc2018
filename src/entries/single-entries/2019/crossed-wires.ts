import { entryForFile } from "../../entry";
import { Coordinate, directions, sumCoordinate } from "../../../support/geometry";
import wu from "wu";
import { range } from "../../../support/sequences";

interface Movement {
    direction: "L" | "R" | "D" | "U";
    length: number;
}

interface StepCoordinate {
    step: number;
    coordinate: Coordinate;
}

function mapDirection(direction: Movement["direction"]): Coordinate {
    switch (direction) {
        case "D":
            return directions.down;
        case "U":
            return directions.up;
        case "L":
            return directions.left;
        case "R":
            return directions.right;
    }
}

function updatePosition(position: Coordinate, movement: Movement): Coordinate[] {
    const directionCoordinate = mapDirection(movement.direction);
    return wu(range(movement.length)).map((i) => {
        position = sumCoordinate(position, directionCoordinate);
        return position;
    }).toArray();
}

function parseWire(s: string) {
    return s.split(",").map((e) => ({
        direction: e[0],
        length: parseInt(e.slice(1), 10)
    }) as Movement);
}

type Cell = undefined | "b" | "a" | "+";

function getIntersection<T, U>(a: T[], b: T[], comparer: (a: T, b: T) => number, mapper: (a: T, b: T) => U): U[] {
    a = [...a];
    b = [...b];
    const result = [];
    let aIndex = 0;
    let bIndex = 0;
    while (aIndex < a.length - 1 && bIndex < b.length - 1) {
        const comparison = comparer(a[aIndex], b[bIndex]);
        if (comparison === 0) {
            result.push(mapper(a[aIndex], b[bIndex]));
            aIndex++;
            bIndex++;
        } else if (comparison < 0) {
            aIndex++;
        } else {
            bIndex++;
        }
    }
    return result;
}

export const crossedWires = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const firstWire = parseWire(lines[0]);
        const secondWire = parseWire(lines[1]);

        const comparer = (a: Coordinate, b: Coordinate) => a.x === b.x ? (b.y - a.y) : b.x - a.x;
        const firstCoordinates = getCoordinates({ x: 0, y: 0 }, firstWire).sort(comparer);
        await outputCallback("Got first");
        const secondCoordinates = getCoordinates({ x: 0, y: 0 }, secondWire).sort(comparer);
        await outputCallback("Got second");

        const intersection = getIntersection(firstCoordinates, secondCoordinates, comparer, (a, b) => a);

        const minDistance = intersection
            .map((i) => Math.abs(i.x) + Math.abs(i.y))
            .reduce((acc, next) => Math.min(acc, next));

        await outputCallback(`Result: ${minDistance}`);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const firstWire = parseWire(lines[0]);
        const secondWire = parseWire(lines[1]);

        const comparer = (a: StepCoordinate, b: StepCoordinate) =>
            a.coordinate.x === b.coordinate.x ?
                (b.coordinate.y - a.coordinate.y)
                : b.coordinate.x - a.coordinate.x;
        const firstCoordinates = getCoordinates({ x: 0, y: 0 }, firstWire);
        const sortedFirst = firstCoordinates.map((c, i) => ({ coordinate: c, step: i + 1 })).sort(comparer);
        await outputCallback("Got first");
        const secondCoordinates = getCoordinates({ x: 0, y: 0 }, secondWire);
        const sortedSecond = secondCoordinates.map((c, i) => ({ coordinate: c, step: i + 1 })).sort(comparer);
        await outputCallback("Got second");

        const intersection = getIntersection(
            sortedFirst,
            sortedSecond,
            comparer,
            (a, b) => ({ coordinate: a.coordinate, first: a.step, second: b.step })
        );
        const result = intersection.map((e) => e.first + e.second).reduce((acc, next) => Math.min(acc, next));
        await outputCallback(`Result: ${result}`);
    },
    { key: "crossed-wires", title: "Crossed Wires", stars: 2, embeddedData: "crossed-wires/crossed-wires"}
);

function getCoordinates(currentPosition: Coordinate, movements: Movement[]) {
    const coordinates = movements.flatMap((m) => {
        const positions = updatePosition(currentPosition, m);
        currentPosition = positions[positions.length - 1];
        return positions;
    });
    return coordinates;
}
