export interface Coordinate {
    x: number,
    y: number
};

function fillWithZero(c: Coordinate): Coordinate {
    return {
        x: c.x ? c.x : 0,
        y: c.y ? c.y : 0
    }
};

export const sumCoordinate = (a: Coordinate, b: Coordinate): Coordinate => {
    a = fillWithZero(a);
    b = fillWithZero(b);
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
} 