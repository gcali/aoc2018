import { entryForFile } from "../../entry";
import { HexCubeCoordinate, sumHexCoordinates, hexManhattanDistance, flatHexDirections } from '../../../support/hex-geometry';

export type Direction = "s" | "sw" | "nw" | "n" | "ne" | "se";

const directionMapper = (d: Direction): HexCubeCoordinate => {
    switch (d) {
        case "n":
            return flatHexDirections.north;
        case "ne":
            return flatHexDirections.northEast;
        case "nw":
            return flatHexDirections.northWest;
        case "s":
            return flatHexDirections.south;
        case "se":
            return flatHexDirections.southEast;
        case "sw":
            return flatHexDirections.southWest;
    }
} 

export const applyDirections = (start: HexCubeCoordinate, directions: Direction[], callback?: (currentPosition: HexCubeCoordinate) => void): HexCubeCoordinate => {
        return directions.reduce((acc, next) => {
            const result = sumHexCoordinates(acc, directionMapper(next));
            if (callback) {
                callback(result);
            }
            return result;
        }, start);
}

export const hexEd = entryForFile(
    async ({ lines, outputCallback }) => {
        const directions = lines[0].split(",").map(e => e as Direction).filter(e => e !== null);


        const center: HexCubeCoordinate = {
            x: 0,
            y: 0,
            z: 0
        };
        const result = applyDirections(center, directions);
        await outputCallback(hexManhattanDistance(center, result));
    },
    async ({ lines, outputCallback }) => {
        const directions = lines[0].split(",").map(e => e as Direction).filter(e => e !== null);


        const center: HexCubeCoordinate = {
            x: 0,
            y: 0,
            z: 0
        };
        let maxDistance = Number.NEGATIVE_INFINITY;
        applyDirections(center, directions, currentPosition => {
            maxDistance = Math.max(maxDistance, hexManhattanDistance(center, currentPosition));
        });
        await outputCallback(maxDistance);
    }
);