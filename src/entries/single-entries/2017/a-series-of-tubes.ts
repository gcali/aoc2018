import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from "../../../support/matrix";
import { CCoordinate, Coordinate, directions, rotate, Rotation, manhattanDistance } from "../../../support/geometry";
import { NotImplementedError } from "../../../support/error";
import { groupBy } from "../../../support/sequences";

type Axis = "horizontal" | "vertical";

function axisFromDirection(direction: CCoordinate) {
    if ((direction.x !== 0) === (direction.y !== 0)) {
        throw new Error("One and only one coordinate can be non zero in a direction");
    }
    if (direction.x !== 0) {
        return "horizontal";
    }
    return "vertical";
}

function expectedFromDirection(direction: CCoordinate) {
    const axis = axisFromDirection(direction);
    if (axis === "horizontal") {
        return "-";
    }
    return "|";
}

interface State  {
    position: Coordinate;
    direction: CCoordinate;
}

type Field = FixedSizeMatrix<string>;

type LetterCallback = (letter: string, direction: CCoordinate, coordinate: Coordinate) => void;

function isLine(s: string) {
    return s === "|" || s === "-";
}

function travel(field: Field, state: State, letterCallback: LetterCallback): State | null {
    const direction = state.direction;
    const expected = expectedFromDirection(direction);
    const currentCell = field.get(state.position);
    if (currentCell === undefined) {
        return null;
    }
    const nextCoordinate = direction.sum(state.position);
    const nextCell = field.get(nextCoordinate);
    if (nextCell === " " || nextCell === undefined) {
        return null;
    } else if (isLine(nextCell)) {
        return {...state, position: nextCoordinate};
    } else if (nextCell === "+") {
        const rotations: Rotation[] = ["Clockwise", "Counterclockwise"];
        const candidateDirections = rotations.map((rotation) => rotate(state.direction, rotation));
        const resultStates = candidateDirections
            .map((direction) => ({direction, state: travel(field, {position: nextCoordinate, direction}, () => {})}))
            .filter((result) => result.state !== null)
        ;
        if (resultStates.length !== 1) {
            throw new Error("Invalid states :( " + JSON.stringify(resultStates));
        }
        return {position: nextCoordinate, direction: resultStates[0].direction};

    } else {
        letterCallback(nextCell, direction, nextCoordinate);
        return {...state, position: nextCoordinate};
    }
}

export const aSeriesOfTubes = entryForFile(
    async ({ lines, outputCallback }) => {
        lines = lines.map((line) => line.trimEnd());
        const maxLineSize = lines.reduce((acc, next) => acc + next.length, 0);
        lines = lines.map((line) => line.padEnd(maxLineSize, " "));
        const matrix: Field = new FixedSizeMatrix<string>({x: maxLineSize, y: lines.length});
        const flat = lines.map((l) => l.split("")).flat();
        matrix.setFlatData(flat);

        const startingPoint = matrix.findOneWithCoordinate((cell, coordinate) => coordinate.y === 0 && cell === "|");
        if (!startingPoint) {
            throw new Error("Starting point not found!");
        }
        await outputCallback(startingPoint);
        let state: State | null = {
            position: startingPoint,
            direction: directions.down
        };

        const foundLetters: string[] = [];

        while (state !== null) {
            state = travel(matrix, state, (letter, direction, coordinate) => {
                foundLetters.push(letter);
                matrix.set(coordinate, expectedFromDirection(direction));
            });
            // if (state != null) {
            //     const output: ({coordinate: Coordinate, cell: string})[] = [];
            //     for (let y = -5; y < 5; y++) {
            //         for (let x = -5; x < 5; x++) {
            //             const coordinate = {
            //                 x: state.position.x + x,
            //                 y: state.position.y + y,
            //             };
            //             output.push({coordinate, cell: x === 0 && y === 0 ? "X" : matrix.get(coordinate) || " "});
            //         }
            //     }
            //     if (output.length != 100) {
            //         throw new Error("Expected 100 of length, got " + output.length);
            //     }
            //     const serializedOutput = groupBy(output, 10).map(group => group.map(e => e.cell).join("")).join("\n");
            //     await outputCallback(serializedOutput);
            // }
        }

        await outputCallback(foundLetters.join(""));

    },
    async ({ lines, outputCallback }) => {
        lines = lines.map((line) => line.trimEnd());
        const maxLineSize = lines.reduce((acc, next) => acc + next.length, 0);
        lines = lines.map((line) => line.padEnd(maxLineSize, " "));
        const matrix: Field = new FixedSizeMatrix<string>({x: maxLineSize, y: lines.length});
        const flat = lines.map((l) => l.split("")).flat();
        matrix.setFlatData(flat);

        const startingPoint = matrix.findOneWithCoordinate((cell, coordinate) => coordinate.y === 0 && cell === "|");
        if (!startingPoint) {
            throw new Error("Starting point not found!");
        }
        await outputCallback(startingPoint);
        let state: State | null = {
            position: startingPoint,
            direction: directions.down
        };

        const foundLetters: string[] = [];

        let lastPosition: Coordinate | null = null;
        let count = 1;
        while (state !== null) {
            state = travel(matrix, state, (letter, direction, coordinate) => {
                foundLetters.push(letter);
                matrix.set(coordinate, expectedFromDirection(direction));
            });
            if (state != null && (lastPosition === null || manhattanDistance(state.position, lastPosition) !== 0)) {
                count++;
                lastPosition = state.position;
            }
            // if (state != null) {
            //     const output: ({coordinate: Coordinate, cell: string})[] = [];
            //     for (let y = -5; y < 5; y++) {
            //         for (let x = -5; x < 5; x++) {
            //             const coordinate = {
            //                 x: state.position.x + x,
            //                 y: state.position.y + y,
            //             };
            //             output.push({coordinate, cell: x === 0 && y === 0 ? "X" : matrix.get(coordinate) || " "});
            //         }
            //     }
            //     if (output.length != 100) {
            //         throw new Error("Expected 100 of length, got " + output.length);
            //     }
            //     const serializedOutput = groupBy(output, 10).map(group => group.map(e => e.cell).join("")).join("\n");
            //     await outputCallback(serializedOutput);
            // }
        }

        await outputCallback(count);
    },
    { key: "a-series-of-tubes", title: "A Series of Tubes", stars: 2, }
);
