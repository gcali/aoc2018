import { sum } from "mathjs";
import { Md5 } from "ts-md5";
import { Lifo, Queue } from "../../../support/data-structure";
import { CCoordinate, Coordinate, directionList, directions, manhattanDistance, serialization } from "../../../support/geometry";
import { calculateDistancesGenericCoordinates } from "../../../support/labyrinth";
import { entryForFile } from "../../entry";

type Hash = (steps: string[] | string) => string;

interface CoordinateWithSteps {
    coordinate: Coordinate;
    steps: string;
    hash: string;
}

const serialize = (coordinate: CoordinateWithSteps): string => {
    const base = serialization.serialize(coordinate.coordinate);
    return `${coordinate.steps}~${base}`;
};

const isString = (s: string[] | string): s is string => {
    return (typeof s) === "string";
};

const hashFactory = (secret: string): Hash => {
    return (steps: string[] | string) => {
        return Md5.hashAsciiStr(secret + (isString(steps) ? steps : steps.join(""))) as string;
    };
};

const isValidCharacter = (c: string): boolean => ["b", "c", "d", "e", "f"].includes(c);

const isDirectionAvailable = (size: Coordinate, c: CoordinateWithSteps, direction: CCoordinate) => {
    const candidate = direction.sum(c.coordinate);
    if (candidate.x < 0 || candidate.y < 0 || candidate.x >= size.x || candidate.y >= size.y) {
        return false;
    }
    if (direction.is(directions.up)) {
        return isValidCharacter(c.hash[0]);
    } else if (direction.is(directions.down)) {
        return isValidCharacter(c.hash[1]);
    } else if (direction.is(directions.left)) {
        return isValidCharacter(c.hash[2]);
    } else if (direction.is(directions.right)) {
        return isValidCharacter(c.hash[3]);
    } else {
        throw new Error("Invalid direction");
    }
};

const serializeDirection = (direction: CCoordinate): string => {
    if (direction.is(directions.up)) {
        return "U";
    } else if (direction.is(directions.down)) {
        return "D";
    } else if (direction.is(directions.left)) {
        return "L";
    } else if (direction.is(directions.right)) {
        return "R";
    } else {
        throw new Error("Invalid direction");
    }
};

export const twoStepsForward = entryForFile(
    async ({ lines, outputCallback }) => {
        const secret = lines[0];
        const hash = hashFactory(secret);
        const size = {x: 4, y: 4};
        const target = {x: 3, y: 3};
        const map = calculateDistancesGenericCoordinates<"x", CoordinateWithSteps>(
            ((c) => "x"),
            (start, end) => manhattanDistance(start.coordinate.coordinate, end.coordinate) + (start.distance || 0),
            (c) => [
                directions.up,
                directions.left,
                directions.down,
                directions.right
            ].filter((e) => isDirectionAvailable(size, c, e)).map((d) => ({
                coordinate: d.sum(c.coordinate),
                steps: c.steps + serializeDirection(d)
            })).map((e) => ({
                ...e,
                hash: hash(e.steps)
            })),
            {coordinate: {x: 0, y: 0}, steps: "", hash: hash([])},
            serialize,
            (e) => manhattanDistance(e.coordinate.coordinate, target) === 0
        );
        await outputCallback(
            map.list
                .filter((e) => manhattanDistance(e.coordinate.coordinate, target) === 0)
                .map((e) => e.coordinate.steps)
            );
    },
    async ({ lines, outputCallback }) => {
        const target = {x: 3, y: 3};
        const secret = lines[0];
        const hash = hashFactory(secret);
        const size = {x: 4, y: 4};
        const queue: CoordinateWithSteps[] = [];
        queue.push({coordinate: {x: 0, y: 0}, steps: "", hash: hash([])});

        let bestResult: number = Number.MIN_VALUE;

        let iteration = 1;
        const spreads: number[] = [];
        while (queue.length > 0) {
            const current = queue.pop()!;
            const surrounding = [
                directions.up,
                directions.left,
                directions.down,
                directions.right
            ].filter((e) => isDirectionAvailable(size, current, e)).map((d) => ({
                coordinate: d.sum(current.coordinate),
                steps: current.steps + serializeDirection(d),
            })).map((e) => ({...e, hash: hash(e.steps)}));
            spreads.push(surrounding.length);
            if (spreads.length > 10000) {
                await outputCallback(sum(spreads) / spreads.length);
                spreads.length = 0;
            }

            for (const s of surrounding) {
                if (manhattanDistance(s.coordinate, target) === 0) {
                    bestResult = Math.max(bestResult, s.steps.length);
                } else {
                    queue.push(s);
                }
            }
            if ((++iteration) % 10000 === 0) {
                await outputCallback("Iteration: " + (iteration / 1000) + "k");
                await outputCallback(`Size: ${queue.length}`);
            }
        }

        await outputCallback(bestResult);
    },
    { key: "two-steps-forward", title: "Two Steps Forward", stars: 2}
);
