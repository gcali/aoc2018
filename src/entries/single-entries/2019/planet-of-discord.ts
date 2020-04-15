import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from '../../../support/matrix';
import { getSurrounding, Coordinate, manhattanDistance, directions, CCoordinate } from '../../../support/geometry';
import { coordinateToKey } from './oxygen-system';

type Cell = "#" | ".";

type Planet = FixedSizeMatrix<Cell>;

type PlanetWithDepth = {
    planet: Planet,
    depth: number
};

const parseLines = (lines: string[]): Planet => {
    const size = {y: lines.length, x: lines[0].length};
    const matrix = new FixedSizeMatrix<Cell>(size);
    const flatData = [...lines.join("")];
    if (flatData.filter(e => e !== "#" && e !== ".").length > 0) {
        throw new Error("Invalid input");
    }
    matrix.setFlatData(flatData.map(e => e as Cell));
    return matrix;
} 

const getInnerAdjacentPositions = (c: Coordinate, inner: PlanetWithDepth): Coordinate[] => {
    const center = getCenter(inner.planet.size);
    if (isDir(c, center, directions.up)) {
        return range(inner.planet.size.x).map(x => ({x, y: 0}));
    } else if (isDir(c, center, directions.down)) {
        return range(inner.planet.size.x).map(x => ({x, y: inner.planet.size.y -1}));
    } else if (isDir(c, center, directions.left)) {
        return range(inner.planet.size.y).map(y => ({x: 0, y}));
    } else if (isDir(c, center, directions.right)) {
        return range(inner.planet.size.y).map(y => ({x: inner.planet.size.x - 1, y}));
    } else {
        throw new Error("Invalid inner position");
    }
}

const getOuterAdjacentPositions = (c: Coordinate, outer: PlanetWithDepth): Coordinate[] => {
    const center = getCenter(outer.planet.size);
    const result: Coordinate[] = [];
    if (c.x === 0) {
        result.push(directions.left.sum(center));
    } 
    if (c.y === 0) {
        result.push(directions.up.sum(center));
    } 
    if (c.x === outer.planet.size.x - 1) {
        result.push(directions.right.sum(center));
    }

    if (c.y === outer.planet.size.y - 1) {
        result.push(directions.down.sum(center));
    }
    return result;
}

const bugCounter = (acc: number, next: Cell) => acc + (next === "#" ? 1 : 0);

const countExternal = (c: Coordinate, main: PlanetWithDepth, outer: PlanetWithDepth): number => {
    const adjacentCellPositions = getOuterAdjacentPositions(c, outer);
    const adjacentCells: Cell[] = adjacentCellPositions
        .map(adjacentCellPosition => outer.planet.get(adjacentCellPosition))
        .filter(cell => cell !== undefined)
        .map(cell => cell!);
    return adjacentCells.concat(getSurrounding(c).map(e => main.planet.get(e)).filter(e => e).map(e => e!))
        .reduce(bugCounter, 0) 
}

const range = (n: number) => [...Array(n).keys()];

const isDir = (c: Coordinate, r: Coordinate, direction: CCoordinate): boolean => {
    return manhattanDistance(c, direction.sum(r)) === 0;
}

const countInternal = (c: Coordinate, main: PlanetWithDepth, inner: PlanetWithDepth): number => {
    const adjacentCellPositions = getInnerAdjacentPositions(c, inner);
    const adjacentCells: Cell[] = adjacentCellPositions
        .map(adjacentCellPosition => inner.planet.get(adjacentCellPosition))
        .filter(cell => cell !== undefined)
        .map(cell => cell!);
    return adjacentCells.concat(getSurrounding(c).map(e => main.planet.get(e)).filter(e => e).map(e => e!))
        .reduce(bugCounter, 0) 
}
const countNeighbourBugs = (
    c: Coordinate,
    main: PlanetWithDepth,
    outer: PlanetWithDepth | undefined, 
    inner: PlanetWithDepth | undefined
): number => {
    if (isExternalBorderCoordinate(main.planet.size, c) && outer) {
        return countExternal(c, main, outer);
    } else if (isInternalBorderCoordinate(main.planet.size, c) && inner) {
        return countInternal(c, main, inner);
    }
    return getSurrounding(c)
        .map(c => main.planet.get(c))
        .filter(c => c)
        .map(c => c!)
        .reduce((acc, next) => acc + (next === "#" ? 1 : 0), 0); 
};

const passDepthTime = async (ps: PlanetWithDepth[]): Promise<PlanetWithDepth[]> => {
    extendDepths(ps);
    const result = ps.map(e => ({
        depth: e.depth,
        planet: e.planet.copy()
    }));
    for (let i = 0; i < ps.length; i++) {
        const outer = ps[i-1];
        const inner = ps[i+1];
        const main = ps[i];
        main.planet.onEveryCell((coordinate, cell) => {
            const nBugs = countNeighbourBugs(coordinate, main, outer, inner);
            handleCellTimePass(cell, nBugs, result[i].planet, coordinate);
        });
    } 
    return result;
};

const passPlanetTime = async (p: Planet): Promise<Planet> => {
    const newPlanet = p.copy();
    await newPlanet.onEveryCell((c, e) => {
        const neighbours = getSurrounding(c);
        const nBugs = neighbours.map(n => p.get(n)).filter(n => n === "#").length;
        handleCellTimePass(e, nBugs, newPlanet, c);
    })
    return newPlanet;
};

const isExternalBorderCoordinate = (size: Coordinate, c: Coordinate): boolean => {
    return c.x === 0 || c.y === 0 || c.x === size.x - 1 || c.y === size.y - 1;
};

const isInternalBorderCoordinate = (size: Coordinate, c: Coordinate): boolean => {
    const center = getCenter(size);

    return manhattanDistance(center, c) === 1;
};

const emptyPlanetGenerator = (size: Coordinate): Planet => {
    const flatData: "."[] = [...Array(size.x * size.y).keys()].map(e => ".");
    const matrix = new FixedSizeMatrix<Cell>(size);
    matrix.setFlatData(flatData);
    return matrix;
};

const getAdditionalDepths = (outer: PlanetWithDepth, inner: PlanetWithDepth): PlanetWithDepth[] => {
    const size = outer.planet.size;
    const externalBorderBugs = outer.planet.reduce(
        (acc, next) => acc + (next.cell === "#" && isExternalBorderCoordinate(size, next.coordinate) ? 1 : 0), 
        0
    );
    const internalBorderBugs = inner.planet.reduce(
        (acc, next) => acc + (next.cell === "#" && isInternalBorderCoordinate(size, next.coordinate) ? 1 : 0),
        0
    );

    let result: PlanetWithDepth[] = [];

    if (externalBorderBugs > 0) {
        result.push({planet: emptyPlanetGenerator(size), depth: outer.depth - 1});
    }
    if (internalBorderBugs > 0) {
        result.push({planet: emptyPlanetGenerator(size), depth: inner.depth + 1});
    }
    return result; 
}

const sortDepths = (planets: PlanetWithDepth[]): void => {
    planets.sort((a, b) => a.depth - b.depth);
}

const extendDepths = (planets: PlanetWithDepth[]): void => {
    sortDepths(planets);
    const [outer, inner] = [planets[0], planets[planets.length -1 ]];
    const additional = getAdditionalDepths(outer, inner);
    additional.forEach(a => planets.push(a));
    sortDepths(additional);
}

const calculateValue = (p: Planet): number => {
    let total = 0;
    let current = 1;
    for (let y = 0; y < p.size.y; y++) {
        for (let x = 0; x < p.size.x; x++) {
            if (p.get({x,y}) === "#") {
                total += current;
            }
            current *= 2;
        }
    }
    return total;
};

export const planetOfDiscord = entryForFile(
    async ({ lines, outputCallback }) => {
        const visitedStates = new Set<string>();
        const matrix = parseLines(lines);
        let planet = matrix;
        let iteration = 0;
        while (true) {
            iteration++;
            if (iteration % 1000 === 0) {
                await outputCallback(`Iteration ${iteration/1000}k`);
            }
            const serializedState = planet.simpleSerialize();
            if (visitedStates.has(serializedState)) {
                break;
            }
            visitedStates.add(serializedState);
            planet = await passPlanetTime(planet);
        }
        await outputCallback(`Found it after ${visitedStates.size}!`);
        await outputCallback("Bio: " + (calculateValue(planet)));
    },
    async ({ lines, outputCallback }) => {
        const basePlanet = parseLines(lines);
        let depths: PlanetWithDepth[] = [{planet: basePlanet, depth: 0}];
        for (let i = 0; i < 200; i++) {
            depths = await passDepthTime(depths);
        }
        await outputCallback(
            depths
                .map(d => d.planet.reduce((acc, next) => acc + (next.cell === "#" ? 1 : 0), 0))
                .reduce((acc, next) => acc + next)
        );
    },
    { key: "planet-of-discord", title: "Planet of Discord"}
);

function getCenter(size: Coordinate) {
    return {
        x: Math.floor(size.x / 2),
        y: Math.floor(size.y / 2)
    };
}

function handleCellTimePass(e: string | undefined, nBugs: number, newPlanet: FixedSizeMatrix<Cell>, c: Coordinate) {
    if (e === "#") {
        if (nBugs !== 1) {
            newPlanet.set(c, ".");
        }
    }
    else if (e === ".") {
        if (nBugs === 1 || nBugs === 2) {
            newPlanet.set(c, "#");
        }
    }
    else {
        throw new Error("Invalid cell");
    }
}
