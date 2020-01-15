import { Coordinate, serialization } from "./geometry";
import { Queue } from "./data-structure";

type FieldGetter<T> = (c: Coordinate) => T | undefined;
export interface CellWithDistance<T> {
    cell: T;
    coordinate: Coordinate;
    distance: number | null;
}

interface DistanceGetter<T> {
    list: Array<CellWithDistance<T>>;
    map(c: Coordinate): (number | null);
}

type DistanceCalculator<T> = (start: CellWithDistance<T>, end: Coordinate) => number | null;

export function calculateDistances<T>(
    fieldGetter: FieldGetter<T>,
    distanceCalculator: DistanceCalculator<T>,
    getSurrounding: (c: Coordinate) => Coordinate[],
    start: Coordinate
): DistanceGetter<T> {
    const distanceMap: { [key: string]: CellWithDistance<T> } = {};

    const visitQueue = new Queue<CellWithDistance<T>>();

    const startCell = fieldGetter(start);
    if (!startCell) {
        throw new RangeError("Cannot find starting cell");
    }
    const startNode: CellWithDistance<T> = {
        cell: startCell,
        coordinate: start,
        distance: 0
    };

    distanceMap[serialization.serialize(startNode.coordinate)] = startNode;
    visitQueue.add(startNode);

    while (!visitQueue.isEmpty) {
        const node = visitQueue.get()!;
        const surrounding = getSurrounding(node.coordinate);
        surrounding.forEach((s) => {
            const withDistance = distanceMap[serialization.serialize(s)];
            if (!withDistance) {
                const cell = fieldGetter(s);
                if (cell) {
                    const distance = distanceCalculator(node, s);
                    if (distance) {
                        const sWithDistance: CellWithDistance<T> = {
                            cell,
                            coordinate: s,
                            distance
                        };
                        distanceMap[serialization.serialize(s)] = sWithDistance;
                        visitQueue.add(sWithDistance);
                    }
                }
            }
        });
    }

    return {
        map: (c: Coordinate) => {
            const v = distanceMap[serialization.serialize(c)];
            if (v) {
                return v.distance;
            } else {
                return null;
            }
        },
        list: Object.values(distanceMap)
    };
}
