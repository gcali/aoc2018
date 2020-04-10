import { Coordinate, serialization } from "./geometry";
import { Queue } from "./data-structure";

type FieldGetter<TValue, TCoordinate> = (c: TCoordinate) => TValue | undefined;
export interface CellWithDistance<TValue, TCoordinate> {
    cell: TValue;
    coordinate: TCoordinate;
    distance: number | null;
}

interface DistanceGetter<TValue, TCoordinate> {
    list: Array<CellWithDistance<TValue, TCoordinate>>;
    map(c: TCoordinate): (number | null);
}

type DistanceCalculator<TValue, TCoordinate> = (start: CellWithDistance<TValue, TCoordinate>, end: TCoordinate) => number | null;

export function calculateDistancesGenericCoordinates<TValue, TCoordinate>(
    fieldGetter: FieldGetter<TValue, TCoordinate>,
    distanceCalculator: DistanceCalculator<TValue, TCoordinate>,
    getSurrounding: (c: TCoordinate) => TCoordinate[],
    start: TCoordinate,
    serializer: (c: TCoordinate) => string
): DistanceGetter<TValue, TCoordinate> {
    const distanceMap: { [key: string]: CellWithDistance<TValue, TCoordinate> } = {};

    const visitQueue = new Queue<CellWithDistance<TValue, TCoordinate>>();

    const startCell = fieldGetter(start);
    if (!startCell) {
        throw new RangeError("Cannot find starting cell");
    }
    const startNode: CellWithDistance<TValue, TCoordinate> = {
        cell: startCell,
        coordinate: start,
        distance: 0
    };

    distanceMap[serializer(startNode.coordinate)] = startNode;
    visitQueue.add(startNode);

    while (!visitQueue.isEmpty) {
        const node = visitQueue.get()!;
        const surrounding = getSurrounding(node.coordinate);
        surrounding.forEach((s) => {
            const withDistance = distanceMap[serializer(s)];
            if (!withDistance) {
                const cell = fieldGetter(s);
                if (cell) {
                    const distance = distanceCalculator(node, s);
                    if (distance) {
                        const sWithDistance: CellWithDistance<TValue, TCoordinate> = {
                            cell,
                            coordinate: s,
                            distance
                        };
                        distanceMap[serializer(s)] = sWithDistance;
                        visitQueue.add(sWithDistance);
                    }
                }
            }
        });
    }

    return {
        map: (c: TCoordinate) => {
            const v = distanceMap[serializer(c)];
            if (v) {
                return v.distance;
            } else {
                return null;
            }
        },
        list: Object.values(distanceMap)
    };
}

export function calculateDistances<T>(
    fieldGetter: FieldGetter<T, Coordinate>,
    distanceCalculator: DistanceCalculator<T, Coordinate>,
    getSurrounding: (c: Coordinate) => Coordinate[],
    start: Coordinate
): DistanceGetter<T, Coordinate> {
    return calculateDistancesGenericCoordinates(
        fieldGetter,
        distanceCalculator,
        getSurrounding,
        start,
        serialization.serialize
    );
    // const distanceMap: { [key: string]: CellWithDistance<T, Coordinate> } = {};

    // const visitQueue = new Queue<CellWithDistance<T, Coordinate>>();

    // const startCell = fieldGetter(start);
    // if (!startCell) {
    //     throw new RangeError("Cannot find starting cell");
    // }
    // const startNode: CellWithDistance<T, Coordinate> = {
    //     cell: startCell,
    //     coordinate: start,
    //     distance: 0
    // };

    // distanceMap[serialization.serialize(startNode.coordinate)] = startNode;
    // visitQueue.add(startNode);

    // while (!visitQueue.isEmpty) {
    //     const node = visitQueue.get()!;
    //     const surrounding = getSurrounding(node.coordinate);
    //     surrounding.forEach((s) => {
    //         const withDistance = distanceMap[serialization.serialize(s)];
    //         if (!withDistance) {
    //             const cell = fieldGetter(s);
    //             if (cell) {
    //                 const distance = distanceCalculator(node, s);
    //                 if (distance) {
    //                     const sWithDistance: CellWithDistance<T, Coordinate> = {
    //                         cell,
    //                         coordinate: s,
    //                         distance
    //                     };
    //                     distanceMap[serialization.serialize(s)] = sWithDistance;
    //                     visitQueue.add(sWithDistance);
    //                 }
    //             }
    //         }
    //     });
    // }

    // return {
    //     map: (c: Coordinate) => {
    //         const v = distanceMap[serialization.serialize(c)];
    //         if (v) {
    //             return v.distance;
    //         } else {
    //             return null;
    //         }
    //     },
    //     list: Object.values(distanceMap)
    // };
}
