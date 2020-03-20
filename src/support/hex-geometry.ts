import { flatten } from 'wu';

export interface HexCubeCoordinate {
    x: number;
    y: number;
    z: number;
}

export const sumHexCoordinates = (a: HexCubeCoordinate, b: HexCubeCoordinate): HexCubeCoordinate => {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
}

export const flatHexDirections = {
    northWest: {x: -1, y: 1, z: 0},
    southEast: {x: 1, y: -1, z: 0},
    northEast: {x: 1, y: 0, z: -1},
    southWest: {x: -1, y: 0, z: 1},
    north: {x: 0, y: 1, z: -1},
    south: {x: 0, y: -1, z: 1},
};

export const hexManhattanDistance = (a: HexCubeCoordinate, b: HexCubeCoordinate): number => {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z))/2;
}