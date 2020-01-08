import { entryForFile } from "../entry";
import { Coordinate, getBoundaries, diffCoordinate, manhattanDistance, getSurrounding } from '../../support/geometry';
import { parseMemory, execute, stopExecution } from '../../support/intcode';
import { FixedSizeMatrix } from '../../support/matrix';
import { NotImplementedError } from '../../support/error';
import { Queue } from '../../support/data-structure';
import { List, Enumerable } from 'linq-typescript';
type Tile = "#" | ".";

interface Cell {
    coordinate: Coordinate;
    tile: Tile;
}

interface CellWithDistance extends Cell {
    distance: number | null;
}

export const commands = {
    up: 1,
    down: 2,
    left: 3,
    right: 4
};


type Dictionary<T> = { [key: string]: T }

type CellMap = Dictionary<Cell>;

export function getCandidates(distances: Dictionary<CellWithDistance>, cellGetter: (c: Coordinate) => Cell | undefined): CellWithDistance[] {
    const candidates = Object.values(distances)
        .filter(e => e.tile === '.')
        .filter(e => e.distance !== null)
        .filter(candidate => {
            const target = getEmptySurrounded(candidate, cellGetter);
            return target !== null && target !== undefined;
        })
        .sort((a, b) => a.distance! - b.distance!);
    return candidates;
}

export class Field {
    private cells: CellMap = {};

    constructor(startingCells: Cell[]) {
        startingCells.forEach(c => this.setCell(c));
    }

    public setCell(c: Cell) {
        this.cells[coordinateToKey(c.coordinate)] = c;
    }

    public getCell(c: Coordinate): Cell | undefined {
        return this.cells[coordinateToKey(c)];
    }

    public findCommandsToNearestUnkown(c: Coordinate): [number, Coordinate][] {
        const distances = this.getDistances(c);
        const nearest = this.findNearestToDiscover(c, distances);
        if (nearest === null) {
            return [];
        }
        return this.findCommandsForUnkown({ ...nearest, from: c, distances })
    }

    public findNearestToDiscover(c: Coordinate, distances: Dictionary<CellWithDistance>): { lastKnown: CellWithDistance, unknown: Coordinate } | null {
        const candidates = getCandidates(distances, this.getCell.bind(this));
        if (candidates.length === 0) {
            return null;
        }
        const candidate = candidates[0];
        const target = getEmptySurrounded(candidate, this.getCell.bind(this));
        if (!target) {
            throw new Error("This should not happen, target was already ensured");
        }
        return { lastKnown: candidate, unknown: target.coordinate };
    }

    public findCommandsForUnkown(
        { from, lastKnown, unknown, distances }: {
            from: Coordinate,
            lastKnown: CellWithDistance,
            unknown: Coordinate,
            distances: Dictionary<CellWithDistance>
        }
    ): [number, Coordinate][] {
        let currentCell = lastKnown;
        const commands: [number, Coordinate][] = [[this.getCommand(currentCell.coordinate, unknown), unknown]];
        while (manhattanDistance(currentCell.coordinate, from) !== 0) {
            const canGo = new List(
                getSurrounding(currentCell.coordinate)
                    .map(l => distances[coordinateToKey(l)])
            )
                .where(c => c !== undefined && c.distance !== null)
                .where(c => c.distance === currentCell.distance! - 1)
                .firstOrDefault();
            if (canGo === undefined) {
                return [];
            }
            commands.push([this.getCommand(canGo.coordinate, currentCell.coordinate), currentCell.coordinate]);
            currentCell = canGo;
        }
        return commands.reverse();
    }

    public getDistances(c: Coordinate): Dictionary<CellWithDistance> {
        const cellMap: { [key: string]: CellWithDistance } = {};
        Object.values(this.cells).filter(c => c.tile === ".").forEach(c => cellMap[coordinateToKey(c.coordinate)] = {
            ...c,
            distance: null
        });
        const startingCell = cellMap[coordinateToKey(c)];
        if (!startingCell) {
            return cellMap;
        }
        startingCell.distance = 0;
        const visitingQueue = new Queue<CellWithDistance>();
        visitingQueue.add(startingCell);
        while (!visitingQueue.isEmpty) {
            const toVisit = visitingQueue.get();
            if (toVisit === null) {
                break;
            }
            const next = getSurrounding(toVisit.coordinate).map(c => cellMap[coordinateToKey(c)]);
            next.forEach(cell => {
                if (cell && cell.distance === null && cell.tile === '.') {
                    cell.distance = toVisit.distance! + 1;
                    visitingQueue.add(cell);
                }
            });
        }
        return cellMap;
    }

    private canMove(from: Coordinate, to: Coordinate): boolean {
        const fromCell = this.getCell(from);
        const toCell = this.getCell(to);
        if (!fromCell || !toCell) {
            return false;
        }
        if (fromCell.tile !== '.' || toCell.tile !== '.') {
            return false;
        }
        const distance = manhattanDistance(fromCell.coordinate, toCell.coordinate);
        if (distance !== 1) {
            return false;
        }
        return true;
    }

    public getCommand(from: Coordinate, to: Coordinate): number {
        if (manhattanDistance(from, to) !== 1) {
            throw new RangeError("Cannot move to distant cell");
        }
        if (from.x > to.x) {
            return commands.left;
        } else if (from.x < to.x) {
            return commands.right;
        } else if (from.y > to.y) {
            return commands.up;
        } else if (from.y < to.y) {
            return commands.down;
        } else {
            throw new Error("Something went wrong :(");
        }
    }

    public toString() {
        const boundaries = getBoundaries(Object.values(this.cells).map(c => c.coordinate));
        const matrix = new FixedSizeMatrix<string>(boundaries.size);
        matrix.fill(undefined);
        Object.values(this.cells).forEach(c => matrix.set(diffCoordinate(c.coordinate, boundaries.topLeft), c.tile));
        return matrix.toString(e => e ? e : " ");
    }

    public static fromSerialization(serialization: string): Field {
        const lines = serialization.trim().split("\n");
        const matrix = lines.map(l => l.trim().split(""));
        const cells: Cell[] = matrix.flatMap((line, lineIndex) => line.map((cell, cellIndex) => {
            if (cell === "." || cell === "#") {
                return {
                    coordinate: {
                        x: cellIndex,
                        y: lineIndex
                    },
                    tile: cell
                } as Cell;
            } else {
                return null;
            }
        })).filter(c => c).map(c => c!);
        return new Field(cells);

    }

    public getDistance(from: Coordinate, to: Coordinate): number | null {
        const distances = this.getDistances(from);
        const distance = distances[coordinateToKey(to)];
        if (!distance || !distance.distance) {
            return null;
        } else {
            return distance.distance!;
        }
    }

}

function getEmptySurrounded(candidate: CellWithDistance, cellGetter: (c: Coordinate) => Cell | undefined) {
    const surrounding = new List(getSurrounding(candidate.coordinate).map(c => ({ coordinate: c, cell: cellGetter(c) })));
    const target = surrounding.where(s => !s.cell).firstOrDefault();
    return target;
}

export function coordinateToKey(c: Coordinate): string {
    return `${c.x}|${c.y}`;
}

export function keyToCoordinate(s: string): Coordinate {
    const [x, y] = s.split('|');
    return {
        x: parseInt(x, 10),
        y: parseInt(y, 10)
    };
}

export const oxygenSystem = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const cells: Cell[] = [{
            coordinate: { x: 0, y: 0 },
            tile: "."
        }];

        const field = new Field(cells);
        let currentPosition: Coordinate = { x: 0, y: 0 };
        let movingTo: Coordinate | null = currentPosition;
        let suggestedCommands: [number, Coordinate][] = [];
        const program = parseMemory(lines[0]);
        let oxygenPosition: Coordinate | null = null;
        let currentIteration = 0;
        await execute({
            memory: program, input: async () => {
                await pause();
                let answer: number = -1;
                if (suggestedCommands.length > 0) {
                    let [command, position] = suggestedCommands.pop()!;
                    movingTo = position;
                    answer = command;
                } else {
                    const suggestion = field.findCommandsToNearestUnkown(currentPosition);
                    if (!suggestion || suggestion.length === 0) {
                        stopExecution();
                    } else {
                        suggestedCommands = suggestion.reverse();
                    }
                    let [command, position] = suggestedCommands.pop()!;
                    movingTo = position;
                    answer = command;
                }
                return answer;
            },
            output: async (n) => {
                switch (n) {
                    case 0:
                        field.setCell({ coordinate: movingTo!, tile: "#" });
                        movingTo = null;
                        break;
                    case 1:
                        currentPosition = movingTo!;
                        field.setCell({ coordinate: movingTo!, tile: "." });
                        movingTo = null;
                        break;
                    case 2:
                        currentPosition = movingTo!;
                        field.setCell({ coordinate: currentPosition, tile: "." });
                        movingTo = null;
                        oxygenPosition = currentPosition;
                        break;
                }
                if (currentIteration++ % 100 === 0) {
                    await outputCallback(field.toString(), true);
                }
            }
        });

        await outputCallback(field.toString());

        const distance = field.getDistance({ x: 0, y: 0 }, oxygenPosition!);
        await outputCallback(distance);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const cells: Cell[] = [{
            coordinate: { x: 0, y: 0 },
            tile: "."
        }];

        const field = new Field(cells);
        let currentPosition: Coordinate = { x: 0, y: 0 };
        let movingTo: Coordinate | null = currentPosition;
        let suggestedCommands: [number, Coordinate][] = [];
        const program = parseMemory(lines[0]);
        let oxygenPosition: Coordinate | null = null;
        await execute({
            memory: program, input: async () => {
                await pause();
                let answer: number = -1;
                if (suggestedCommands.length > 0) {
                    let [command, position] = suggestedCommands.pop()!;
                    movingTo = position;
                    answer = command;
                } else {
                    const suggestion = field.findCommandsToNearestUnkown(currentPosition);
                    if (!suggestion || suggestion.length === 0) {
                        stopExecution();
                    } else {
                        suggestedCommands = suggestion.reverse();
                    }
                    let [command, position] = suggestedCommands.pop()!;
                    movingTo = position;
                    answer = command;
                }
                return answer;
            },
            output: async (n) => {
                switch (n) {
                    case 0:
                        field.setCell({ coordinate: movingTo!, tile: "#" });
                        movingTo = null;
                        break;
                    case 1:
                        currentPosition = movingTo!;
                        field.setCell({ coordinate: movingTo!, tile: "." });
                        movingTo = null;
                        break;
                    case 2:
                        currentPosition = movingTo!;
                        field.setCell({ coordinate: currentPosition, tile: "." });
                        movingTo = null;
                        oxygenPosition = currentPosition;
                        break;
                }
            }
        });

        await outputCallback(field.toString());

        const distance = field.getDistance({ x: 0, y: 0 }, oxygenPosition!);
        const distances = Object.values(field.getDistances(oxygenPosition!));
        await outputCallback(distances.filter(d => d !== null).map(d => d.distance!).reduce((a, b) => Math.max(a, b)));
    }
);
