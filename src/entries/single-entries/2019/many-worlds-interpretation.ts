import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from '../../../support/matrix';
import { calculateDistances } from '../../../support/labyrinth';
import { manhattanDistance, getSurrounding, Coordinate } from '../../../support/geometry';

interface Door {
    key: string;
}

interface Key {
    name: string;
}

type LabyrinthCell = "#" | "." | "@" | Door | Key;

function isDoor(e: LabyrinthCell): e is Door {
    return (e as Door).key !== undefined;
}

function isKey(e: LabyrinthCell): e is Key {
    return (e as Key).name !== undefined;
}

export class Labyrinth {
    constructor(private matrix: FixedSizeMatrix<LabyrinthCell>) {
        const startCoordinate = matrix.findOne(c => c === "@");
        if (!startCoordinate) {
            throw new RangeError("Could not find starting cell");
        }
        this.startCoordinate = startCoordinate;
    }

    public toString(): string {
        return this.matrix.toString(e => {
            if (e === undefined) {
                return "";
            } else if (typeof (e) === "string") {
                return e;
            } else if (isDoor(e)) {
                return e.key.toUpperCase();
            } else {
                return e.name;
            }
        })
    }

    private readonly startCoordinate: Coordinate;

    public getDistances() {

        const distanceMap = calculateDistances(
            c => this.matrix.get(c),
            (a, b) => {
                const destination = this.matrix.get(b);
                if (!destination || destination === "#" || isDoor(destination)) {
                    return null;
                } else {
                    return manhattanDistance(a.coordinate, b) + a.distance!
                }
            },
            getSurrounding,
            this.startCoordinate
        );

        return distanceMap.list;
    }


}

function parseLines(lines: string[]): Labyrinth {
    const flat = lines.flatMap(line => line.split("").map((token: string): LabyrinthCell => {
        switch (token) {
            case "#":
            case ".":
            case "@":
                return token;
            default:
                if (token.toUpperCase() === token) {
                    return {
                        key: token.toLowerCase()
                    } as Door;
                } else {
                    return {
                        name: token
                    } as Key;
                }
        }
    }));
    const matrix = new FixedSizeMatrix<LabyrinthCell>({ x: lines[0].length, y: lines.length });
    matrix.setFlatData(flat);
    return new Labyrinth(matrix);
}

export const manyWorldInterpretation = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const labyrinth = parseLines(lines);
        await outputCallback(labyrinth.toString());
        await outputCallback(labyrinth.getDistances().map(d => d.cell).filter(c => c !== ".").map(c => JSON.stringify(c)));
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
    }
); 