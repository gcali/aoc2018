import { SimpleBest, ascending } from "./best";
import { coordinateToKey } from "../entries/single-entries/2019/oxygen-system";

export interface Coordinate {
    x: number;
    y: number;
}

export interface Coordinate3d {
    x: number;
    y: number;
    z: number;
}

export type FullCoordinate = Coordinate | Coordinate3d;

function is3d(c: FullCoordinate): c is Coordinate3d {
    return (c as Coordinate3d).z !== undefined;
}

function isBounds(c: Coordinate | Bounds): c is Bounds {
    return (c as Bounds).size !== undefined;
}

export class CCoordinate implements Coordinate {

    public get opposite() {
        return new CCoordinate(-this.x, -this.y);
    }

    public static fromCoordinate(c: Coordinate) {
        return new CCoordinate(c.x, c.y);
    }
    public constructor(public x: number, public y: number) {

    }

    public isInBounds = (b: Bounds | Coordinate): boolean => {
        if (isBounds(b)) {
            return isInBounds(this, b);
        } else {
            return isInBounds(this, {
                size: b,
                topLeft: {
                    x: 0,
                    y: 0
                }
            });
        }
    }

    public is = (other: Coordinate) => {
        return manhattanDistance(this, other) === 0;
    }

    public sum = (other: Coordinate) => {
        const result = sumCoordinate(this, other);
        return new CCoordinate(result.x, result.y);
    }

    public diff = (other: Coordinate) => {
        const result = sumCoordinate(this, { x: -other.x, y: -other.y });
        return new CCoordinate(result.x, result.y);
    }

    public toString(): string {
        return `(${this.x},${this.y})`;
    }

    public times = (t: number): CCoordinate => {
        const result = scalarCoordinates(this, t);
        return new CCoordinate(result.x, result.y);
    }
}

export const directions = {
    up: new CCoordinate(0, -1),
    down: new CCoordinate(0, 1),
    left: new CCoordinate(-1, 0),
    right: new CCoordinate(1, 0),
    upLeft: new CCoordinate(-1, -1),
    upRight: new CCoordinate(1, -1),
    downLeft: new CCoordinate(-1, 1),
    downRight: new CCoordinate(1, 1)
};

export const directionList = [
    directions.up,
    directions.down,
    directions.left,
    directions.right,
    directions.upLeft,
    directions.upRight,
    directions.downLeft,
    directions.downRight
];

export type Rotation = "Clockwise" | "Counterclockwise" | "None";
export function rotate(
    coordinate: CCoordinate,
    direction: Rotation,
    times: number = 1
    ): CCoordinate {
    if (times > 1) {
        coordinate = rotate(coordinate, direction, times - 1);
    }
    switch (direction) {
        case "Counterclockwise":
            return new CCoordinate(coordinate.y, -coordinate.x);
        case "Clockwise":
            return new CCoordinate(-coordinate.y, coordinate.x);
        case "None":
            return coordinate;
    }
}


function fillWithZero(c: Coordinate): Coordinate {
    return {
        x: c.x ? c.x : 0,
        y: c.y ? c.y : 0,
    };
}

export interface Bounds {
    topLeft: Coordinate;
    size: Coordinate;
}

export function ascendingCompare(a: Coordinate, b: Coordinate): number {
    if (b.y === a.y) {
        return ascending(a.x, b.x);
    } else {
        return ascending(a.y, b.y);
    }
}

export function isInBounds(c: Coordinate, bounds: Bounds) {
    return (
        c.x >= bounds.topLeft.x &&
        c.y >= bounds.topLeft.y &&
        c.x < bounds.topLeft.x + bounds.size.x &&
        c.y < bounds.topLeft.y + bounds.size.y
    );
}
export const getBoundaries = (points: Coordinate[]): Bounds => {
    if (points.length === 0) {
        return {
            topLeft: { x: 0, y: 0 },
            size: { x: 0, y: 0 }
        };
    }
    const { maxX, minX, maxY, minY } = getRanges(points);
    const size = {
        x: (maxX.currentBest! - minX.currentBest! + 1),
        y: (maxY.currentBest! - minY.currentBest! + 1),
    };
    return {
        topLeft: {
            x: minX.currentBest!,
            y: minY.currentBest!,
        },
        size,
    };
};

export const sumCoordinate = (a: Coordinate, b: Coordinate): Coordinate => {
    a = fillWithZero(a);
    b = fillWithZero(b);
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    };
};

export function getDirection(from: Coordinate, to: Coordinate): CCoordinate {
    if (manhattanDistance(from, to) !== 1) {
        throw new RangeError("Cannot move to distant cell");
    }
    if (from.x > to.x) {
        return directions.left;
    } else if (from.x < to.x) {
        return directions.right;
    } else if (from.y > to.y) {
        return directions.up;
    } else if (from.y < to.y) {
        return directions.down;
    } else {
        throw new Error("Something went wrong :(");
    }
}

export const scalarCoordinates = (a: Coordinate, l: number) => ({ x: a.x * l, y: a.y * l });

export const oppositeCoordinate = (a: Coordinate): Coordinate => ({ x: -a.x, y: -a.y });

export const diffCoordinate = (a: Coordinate, b: Coordinate): Coordinate => sumCoordinate(a, oppositeCoordinate(b));
export const manhattanDistance = (a: FullCoordinate, b: FullCoordinate) => {
    const z = (is3d(a) && is3d(b)) ? Math.abs(a.z - b.z) : 0;
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + z;
};

export const getSurrounding = (c: Coordinate): Coordinate[] => [
    directions.up,
    directions.left,
    directions.down,
    directions.right
].map((d) => d.sum(c));

export const getFullSurrounding = (c: Coordinate): Coordinate[] => [
    directions.up,
    directions.left,
    directions.down,
    directions.right,
    directions.upLeft,
    directions.upRight,
    directions.downLeft,
    directions.downRight,
].map((d) => d.sum(c));

export function getRanges(points: Coordinate[]) {
    const minComparator = (a: number, b: number) => b - a;
    const maxComparator = (a: number, b: number) => a - b;
    const minX = new SimpleBest<number>(minComparator);
    const maxX = new SimpleBest<number>(maxComparator);
    const minY = new SimpleBest<number>(minComparator);
    const maxY = new SimpleBest<number>(maxComparator);
    points.forEach((p) => {
        minX.add(p.x);
        maxX.add(p.x);
        minY.add(p.y);
        maxY.add(p.y);
    });
    return { maxX, minX, maxY, minY };
}

export function getCoordinateForGrid(index: number, rows: number): Coordinate {
    return {
        x: Math.floor(index / rows),
        y: index % rows
    };
}


export const serialization = {
    serialize(c: Coordinate): string {
        return `${c.x}|${c.y}`;
    },
    deserialize(s: string): Coordinate {
        const split = s.split("|");
        if (split.length !== 2) {
            throw new RangeError("Could not deserialize " + s);
        }
        return {
            x: parseInt(split[0], 10),
            y: parseInt(split[1], 10)
        };
    }
};

export const euclidean3dDistance = (a: Coordinate3d, b: Coordinate3d): number => {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
};

export const multiplyCoordinate = (a: Coordinate, b: Coordinate): Coordinate => {
    return {
        x: a.x * b.x,
        y: a.y * b.y
    };
};
