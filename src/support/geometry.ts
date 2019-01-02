import { SimpleBest } from './best';

export interface Coordinate {
    x: number;
    y: number;
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
        x: (maxX.currentBest - minX.currentBest + 1),
        y: (maxY.currentBest - minY.currentBest + 1),
    };
    return {
        topLeft: {
            x: minX.currentBest,
            y: minY.currentBest,
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
