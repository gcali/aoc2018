import { SimpleBest, ascending } from "./best";

export interface Coordinate {
    x: number;
    y: number;
}

function isBounds(c: Coordinate | Bounds): c is Bounds {
    return (c as Bounds).size !== undefined;
}

export class CCoordinate implements Coordinate {
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

export type Rotation = "Clockwise" | "Counterclockwise";
export function rotate(coordinate: CCoordinate, direction: Rotation): CCoordinate {
    switch (direction) {
        case "Clockwise":
            return new CCoordinate(coordinate.y, -coordinate.x);
        case "Counterclockwise":
            return new CCoordinate(-coordinate.y, coordinate.x);
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

export function ascendingCompare(a: Coordinate, b: Coordinate) {
    if (b.y === a.y) {
        return ascending(a.x, b.x);
    } else {
        return ascending(a.y, b.y);
    }
}

export function isInBounds(c: Coordinate, bounds: Bounds) {
    return c.x >= bounds.topLeft.x && c.y >= bounds.topLeft.y && c.x < bounds.topLeft.x + bounds.size.x && c.y < bounds.topLeft.y + bounds.size.y;
}
export const getBoundaries = (points: Coordinate[]): Bounds => {
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

export const scalarCoordinates = (a: Coordinate, l: number) => ({ x: a.x * l, y: a.y * l });

export const oppositeCoordinate = (a: Coordinate): Coordinate => ({ x: -a.x, y: -a.y });

export const diffCoordinate = (a: Coordinate, b: Coordinate): Coordinate => sumCoordinate(a, oppositeCoordinate(b));
export const manhattanDistance = (a: Coordinate, b: Coordinate) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const getSurrounding = (c: Coordinate): Coordinate[] => [
    directions.up,
    directions.left,
    directions.down,
    directions.right
].map(d => d.sum(c));

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
}