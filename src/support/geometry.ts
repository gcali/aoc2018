import { SimpleBest, ascending } from "./best";

export interface Coordinate {
    x: number;
    y: number;
}

export class CCoordinate implements Coordinate {
    public constructor(public x: number, public y: number) {

    }

    public isInBounds = (b: Bounds) => isInBounds(this, b);

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
