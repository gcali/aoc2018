import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from '../../../support/matrix';
import { Coordinate, getSurrounding, manhattanDistance } from '../../../support/geometry';
import { NotImplementedError } from '../../../support/error';
import { calculateDistances, calculateDistancesGenericCoordinates } from '../../../support/labyrinth';

const getPortalCoordinateAndClean = (c: Coordinate, matrix: FixedSizeMatrix<string>): {f: Coordinate, p: string} => {
    const firstLetter = matrix.get(c);
    matrix.set(c, " ");
    const firstNeighbours = getSurrounding(c)
        .map(c => ({c, cell: matrix.get(c)}))
        .filter(e => e.cell && (e.cell === "." || isLetter(e.cell)))
    ;
    if (firstNeighbours.length === 1) {
        const secondLetter = firstNeighbours[0];
        matrix.set(secondLetter.c, " ");
        const floorNeighbour = getSurrounding(secondLetter.c).map(c => ({
            c,
            cell: matrix.get(c)
        })).filter(e => e.cell === ".")[0].c;
        return {
            f: floorNeighbour,
            p: [firstLetter, secondLetter.cell!].sort().join("")
        };
    } else {
        const secondLetter = firstNeighbours.filter(e => isLetter(e.cell!))[0];
        matrix.set(secondLetter.c, " ");
        const floor = firstNeighbours.filter(e => !isLetter(e.cell!))[0].c;
        return {
            f: floor,
            p: [firstLetter, secondLetter.cell!].sort().join("")
        };
    }
};

const isLetter = (s: string): boolean => {
    return s.toLowerCase() !== s || s.toUpperCase() !== s;
}

const serializeCoordinate = (c: Coordinate): string => {
    return `${c.x}|${c.y}`;
}

export const analyzeMatrix = (matrix: FixedSizeMatrix<string>): {
    portals: {c:Coordinate, name: string}[],
    start: Coordinate,
    end: Coordinate} => {
        let start: Coordinate | null = null;
        let end: Coordinate | null = null;
        const portals: {c: Coordinate, name: string}[] = [];
        for (let x = 0; x < matrix.size.x; x++) {
            for (let y = 0; y < matrix.size.y; y++) {
                const cell = matrix.get({x,y});
                if (cell && cell.toLowerCase() !== cell) {
                    const {f: floor, p: name} = getPortalCoordinateAndClean({x,y}, matrix);
                    if (name === "AA") {
                        start = floor;
                    } else if (name === "ZZ") {
                        end = floor;
                    }
                    portals.push({c: floor, name});
                }
            }
        }

        if (start === null || end === null) {
            throw new Error("No start or end found, parsing went wrong");
        }
        return {portals, start, end}; 
}


export const donutMaze = entryForFile(
    async ({ lines, outputCallback }) => {
        const matrix = parseLines(lines); 
        const {portals, start, end} = analyzeMatrix(matrix);
        const portalMap = createPortalMap(portals); 
        const distances = calculateDistances(
            (c) => matrix.get(c),
            (start, end) => (start.distance || 0) + 1,
            c => {
                return getSurrounding(c).map(coordinate => {
                    const n = matrix.get(coordinate);
                    if (n === ".") {
                        return coordinate;
                    }
                    const portaled = portalMap.get(serializeCoordinate(c));
                    if (portaled === undefined) {
                        return null;
                    }
                    return portaled;
                }).filter(e => e !== null).map(e => e!);
            },
            start
        ); 
        await outputCallback(distances.map(end)); 
    },
    async ({ lines, outputCallback }) => {
        const matrix = parseLines(lines); 
        const {portals, start, end} = analyzeMatrix(matrix);
        const portalMap = createPortalMap(portals); 
        const distances = calculateDistancesGenericCoordinates(
            (c) => matrix.get(c),
            (start, end) => (start.distance || 0) + 1,
            c => {
                return getSurrounding(c).map(coordinate => {
                    const n = matrix.get(coordinate);
                    if (n === ".") {
                        return {...coordinate, depth: c.depth};
                    }
                    const portaled = portalMap.get(serializeCoordinate(c));
                    if (portaled === undefined) {
                        return null;
                    }
                    return {...portaled, depth: 0};
                }).filter(e => e !== null).map(e => e!);
            },
            {x: start.x, y: start.y, depth: 0},
            e => `${e.x}|${e.y}|${e.depth}`
        ); 
        await outputCallback(distances.map({...end, depth: 0})); 
    },
    { key: "donut-maze", title: "Donut Maze"}
);

function parseLines(lines: string[]): FixedSizeMatrix<string> {
    const matrix = new FixedSizeMatrix<string>({ x: lines[0].length, y: lines.length });
    matrix.setFlatData(lines.flatMap(e => e.split("")));
    return matrix;
}

function createPortalMap(portals: { c: Coordinate; name: string; }[]) : Map<string, Coordinate> {
    const portalNameMap = new Map<string, Coordinate[]>();
    portals.forEach(portal => {
        let l = portalNameMap.get(portal.name);
        if (l === undefined) {
            l = [];
            portalNameMap.set(portal.name, l);
        }
        l.push(portal.c);
    });
    const portalMap = new Map<string, Coordinate>();
    [...portalNameMap.keys()].filter(k => k !== "AA" && k !== "ZZ").map(k => portalNameMap.get(k)!).forEach(ls => {
        if (ls.length !== 2) {
            throw new Error("Parsing went wrong, " + ls.length);
        }
        portalMap.set(serializeCoordinate(ls[0]), { x: ls[1].x, y: ls[1].y });
        portalMap.set(serializeCoordinate(ls[1]), { x: ls[0].x, y: ls[0].y });
    });
    return portalMap;
}
