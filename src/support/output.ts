import { Coordinate, Bounds } from "./geometry";

interface ColoredPoint {
    coordinates: Coordinate;
    color: number;
}

export const writeImgFromPoints = (
    fileName: string,
    boundaries: Bounds,
    points: ColoredPoint[],
    scale: number = 1,
    background: number = 0x00000000,
) => {
    throw Error("Not implemented");
};
