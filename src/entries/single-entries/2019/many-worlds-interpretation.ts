import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from "../../../support/matrix";
import { calculateDistances, CellWithDistance } from "../../../support/labyrinth";
import { manhattanDistance, getSurrounding, Coordinate, CCoordinate, getDirection } from "../../../support/geometry";
import { List } from "linq-typescript";

interface Door {
    key: string;
}

export interface Key {
    name: string;
}

interface PathLookup { [key: string]: CCoordinate[]; }

function stateSerializer(currentCoordinate: Coordinate, keys: string[]): string {
    const key = JSON.stringify({
        c: currentCoordinate, k: keys.sort()
    });
    return key;
}

type LabyrinthCell = "#" | "." | "@" | Door | Key;

function isDoor(e: LabyrinthCell): e is Door {
    return (e as Door).key !== undefined;
}

export function isKey(e: LabyrinthCell): e is Key {
    return (e as Key).name !== undefined;
}

export class Labyrinth {

    public readonly startCoordinate: Coordinate;
    constructor(private matrix: FixedSizeMatrix<LabyrinthCell>) {
        const startCoordinate = matrix.findOne((c) => c === "@");
        if (!startCoordinate) {
            throw new RangeError("Could not find starting cell");
        }
        this.startCoordinate = startCoordinate;
    }

    public toString(): string {
        return this.matrix.toString((e) => {
            if (e === undefined) {
                return "";
            } else if (typeof (e) === "string") {
                return e;
            } else if (isDoor(e)) {
                return e.key.toUpperCase();
            } else {
                return e.name;
            }
        });
    }

    public getDestinations() {
        const distances = this.getDistances();
        const destinations = this.filterDestinations(distances);
        return destinations;
    }

    public getDestinationsWithPaths() {
        const distances = this.getDistances();
        const destinations = this.filterDestinations(distances);
        return destinations.map((destination) => ({
            destination,
            path: this.getPathFor(destination.coordinate, distances)
        }));
    }

    public moveTo(target: Coordinate): Labyrinth {
        const matrix = this.matrix.copy();
        matrix.set(this.startCoordinate, ".");
        const targetCell = matrix.get(target);
        if (!targetCell || isDoor(targetCell) || targetCell === "#") {
            throw new Error("Cannot move to " + JSON.stringify(target));
        }
        matrix.set(target, "@");
        if (targetCell && isKey(targetCell)) {
            const findDoor = matrix.findOne((e) => isDoor(e) && e.key === targetCell.name);
            if (findDoor !== null) {
                matrix.set(findDoor, ".");
            }
        }
        return new Labyrinth(matrix);
    }

    public getPathFor(target: Coordinate, cachedDistances: Array<CellWithDistance<LabyrinthCell>> | null = null) {
        if (cachedDistances === null) {
            cachedDistances = this.getDistances();
        }

        const cellFinder = (cellToFind: Coordinate) =>
            new List(
                cachedDistances!
                    .filter((c) => manhattanDistance(c.coordinate, cellToFind) === 0)
            ).firstOrDefault() || null;

        let currentCell = cellFinder(target);
        if (currentCell === null || currentCell.distance === null) {
            throw new Error("Could not find distance for target");
        }
        const steps: CCoordinate[] = [];
        while (currentCell!.distance! > 0) {
            if (!currentCell) {
                throw new Error("Current cell should be valorized");
            }
            const targetCoordinate: Coordinate = currentCell!.coordinate;
            const targetDistance: number = currentCell.distance!;
            const candidateSteps = getCandidateSteps(targetCoordinate, cellFinder, targetDistance);
            if (candidateSteps.length < 1) {
                throw new Error(`Could not find a path for ${JSON.stringify(targetCoordinate)} :(`);
            }
            steps.push(getDirection(candidateSteps[0]!.coordinate, currentCell!.coordinate));
            currentCell = candidateSteps[0]!;
        }

        return steps.reverse();
    }

    public async findBestStrategy(debug?: Debug, cache?: PathLookup): Promise<CCoordinate[]> {
        if (cache) {
            const cachedValue = cache[stateSerializer(this.startCoordinate, this.listKeys())];
            if (cachedValue !== undefined && cachedValue !== null) {
                if (debug && debug.level <= 8) {
                    await debug.output("Cached!");
                }
                return cachedValue;
            }
        } else {
            cache = {};
        }
        while (true) {
            const destinations = this.getDestinationsWithPaths();
            if (destinations.length === 0) {
                return [];
            }
            let bestResult = Number.POSITIVE_INFINITY;
            let bestSteps: CCoordinate[] = [];
            const wrappedDebug: Debug | undefined = debug ? ({
                output: async (s) => await debug.output(" " + s),
                pause: debug.pause,
                level: debug.level + 1

            }) : undefined;
            for (const destination of destinations) {
                if (debug) {
                    if (debug.level <= 6) {
                        await debug.output("Cell: " + JSON.stringify(destination.destination.cell));
                    } else {
                        await debug.pause();
                    }
                }
                const labyrinthAfterMoving = this.moveTo(destination.destination.coordinate);
                const recursiveResult = await labyrinthAfterMoving.findBestStrategy(wrappedDebug, cache);
                const steps = destination.path.concat(recursiveResult);
                const currentResult = recursiveResult.length + destination.destination.distance!;
                if (currentResult < bestResult) {
                    bestResult = currentResult;
                    bestSteps = steps;
                }
            }
            cache[stateSerializer(this.startCoordinate, this.listKeys())] = bestSteps;
            return bestSteps;
        }
    }
    public listKeys(): string[] {
        return this.matrix.data.filter((d) => d && isKey(d)).map((d) => (d as Key).name);
    }

    public getDistances() {

        const distanceMap = calculateDistances(
            (c) => this.matrix.get(c),
            (a, b) => {
                const destination = this.matrix.get(b);
                if (!destination || destination === "#" || isDoor(destination)) {
                    return null;
                } else {
                    return manhattanDistance(a.coordinate, b) + a.distance!;
                }
            },
            getSurrounding,
            this.startCoordinate
        );

        return distanceMap.list;
    }

    private filterDestinations(distances: Array<CellWithDistance<LabyrinthCell>>) {
        return distances.filter((e) => isKey(e.cell));
    }


}

export function getCandidateSteps(
    targetCoordinate: Coordinate,
    cellFinder: (cellToFind: Coordinate) => CellWithDistance<LabyrinthCell> | null,
    targetDistance: number) {
    return getSurrounding(targetCoordinate)
        .map((t) => cellFinder(t))
        .filter((e) => e !== null && e.distance === targetDistance - 1);
}

export function parseLines(lines: string[]): Labyrinth {
    const flat = lines.flatMap((line) => line.split("").map((token: string): LabyrinthCell => {
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

interface Debug {
    output: (s: string) => Promise<void>;
    pause: () => Promise<void>;
    level: number;
}

export const manyWorldInterpretation = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const labyrinth = parseLines(lines);
        await outputCallback(labyrinth.toString());
        await outputCallback(await labyrinth.findBestStrategy({ output: outputCallback, pause, level: 0 }));
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
    }
);
