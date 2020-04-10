import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from "../../../support/matrix";
import { calculateDistances, CellWithDistance } from "../../../support/labyrinth";
import { manhattanDistance, getSurrounding, Coordinate, CCoordinate, getDirection } from "../../../support/geometry";

const parseLines = (lines: string[]): FixedSizeMatrix<string> => {
    const xSize = lines[0].length;
    const ySize = lines.length;
    const matrix = new FixedSizeMatrix<string>({x: xSize, y: ySize});
    matrix.setFlatData(lines.map(e => e.trim().split("")).flat());
    return matrix;
};

type FixedCell = "#" | ".";

const isFixedCell = (e: string): e is FixedCell => {
    return e === "#" || e === "."; 
}

type RawKey = string;

const isRawKey = (e: string): e is RawKey => {
    return !isFixedCell(e) && e.toLowerCase() === e;
}

export const manyWorldInterpretation = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const matrix = parseLines(lines);
        const matrixStart = matrix.findOneWithCoordinate((e, c) => e === "@");
        if (matrixStart === null) {
            throw new Error("Cannot find start");
        }
        matrix.set(matrixStart, ".");
        let expectedOpenDoors = 0;
        await matrix.onEveryCell((c, e) => {
            if (e && isRawKey(e)) {
                expectedOpenDoors++;
            }
        })
        await outputCallback(expectedOpenDoors);
        let iterations = 0;
        console.log(
            traverseMatrix(
                matrix,
                [matrixStart],
                [],
                expectedOpenDoors,
                new Map<string, number>(),
                () => {
                    iterations++;
                    if (iterations % 1000 === 0) {
                        console.log(`Iterations: ${iterations/1000}k`);
                    }
                }
            ));
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const matrix = parseLines(lines);
        const matrixStart = matrix.findOneWithCoordinate((e, c) => e === "@");
        if (matrixStart === null) {
            throw new Error("Cannot find start");
        }
        matrix.set(matrixStart, "#");
        getSurrounding(matrixStart).forEach(s => matrix.set(s, "#"));
        const matrixStarts = [1,-1].flatMap(x => [1,-1].map(y => ({x: matrixStart.x + x,y: matrixStart.y + y})));
        let expectedOpenDoors = 0;
        await matrix.onEveryCell((c, e) => {
            if (e && isRawKey(e)) {
                expectedOpenDoors++;
            }
        })
        await outputCallback(expectedOpenDoors);
        let iterations = 0;
        console.log(
            traverseMatrix(
                matrix,
                matrixStarts,
                [],
                expectedOpenDoors,
                new Map<string, number>(),
                () => {
                    iterations++;
                    if (iterations % 1000 === 0) {
                        console.log(`Iterations: ${iterations/1000}k`);
                    }
                }
            ));
    },
    { key: "many-worlds-interpretation", title: "Many-Worlds Interpration", stars: 2 }
);

type Cache = Map<string, number>;

const serializeState = (coordinate: Coordinate[], openDoors: string[]) => {
    return JSON.stringify({cs: coordinate.map(c => ({x:c.x, y: c.y})), d: openDoors.sort()});
}

function traverseMatrix(
    matrix: FixedSizeMatrix<string>,
    matrixStarts: Coordinate[],
    openDoors: string[],
    expectedOpenDoors: number,
    cache: Cache,
    debug?: () => void): number { 
    if (debug) {
        debug();
    } 
    const serializedState = serializeState(matrixStarts, openDoors);
    const cachedValue = cache.get(serializedState);
    if (cachedValue !== undefined) {
        return cachedValue;
    }
    
    const reachableKeys = 
        matrixStarts.flatMap((matrixStart, index) => {
            return calculateDistances((e) => matrix.get(e), (start, end) => {
                const origin = start.cell;
                if (!isFixedCell(origin) && 
                    openDoors.indexOf(origin) < 0 && 
                    openDoors.indexOf(origin.toUpperCase()) < 0) {
                    return null;
                }
                const destination = matrix.get(end);
                if (!destination || 
                    (destination !== "." && destination.toUpperCase() === destination && openDoors.indexOf(destination) < 0)
                    || destination === "#") {
                    return null;
                }
                return manhattanDistance(start.coordinate, end) + (start.distance || 0);
            }, getSurrounding, matrixStart!).list
                .filter(e => isRawKey(e.cell))
                .filter(e => openDoors.indexOf(e.cell.toUpperCase()) < 0)
                .map(e => ({reachable: e, startIndex: index}));
        });

    if (reachableKeys.length === 0) {
        if (openDoors.length !== expectedOpenDoors) {
            throw new Error("Did not open all doors");
        }
        return 0;
    }
    // console.log({depth, branching: reachableKeys.length});
    const nestedTotals = reachableKeys.map(cell => {
        const newOpenDoors = openDoors.concat([cell.reachable.cell.toUpperCase()]);
        const nestedDistance = traverseMatrix(
            matrix, 
            matrixStarts.map((start, index) => index === cell.startIndex ? cell.reachable.coordinate : start), 
            newOpenDoors, 
            expectedOpenDoors, 
            cache,
            debug);
        return nestedDistance + cell.reachable.distance!; 
    });
    const bestNestedTotal = nestedTotals.reduce((acc, next) => Math.min(acc, next), Number.POSITIVE_INFINITY);
    cache.set(serializedState, bestNestedTotal);
    return bestNestedTotal;
}

