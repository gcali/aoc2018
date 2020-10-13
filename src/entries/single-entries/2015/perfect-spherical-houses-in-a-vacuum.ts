import { entryForFile } from "../../entry";
import { directions, serialization, CCoordinate } from "../../../support/geometry";

type Directions = ">" | "<" | "^" | "v";

export const perfectSphericalHousesInAVacuum = entryForFile(
    async ({ lines, outputCallback }) => {
        const visited = new Set<string>();
        const startPosition = {
            x: 0,
            y: 0
        };
        const directionMapper: {[key: string]: CCoordinate} = {
            ">": directions.right,
            "<": directions.left,
            "^": directions.up,
            "v": directions.down
        };
        let currentPosition = {...startPosition};

        visited.add(serialization.serialize(currentPosition));

        lines[0].split("").forEach((c) => {
            currentPosition = directionMapper[c].sum(currentPosition);
            visited.add(serialization.serialize(currentPosition));
        });
        await outputCallback(visited.size);
    },
    async ({ lines, outputCallback }) => {
        const visited = new Set<string>();
        const startPosition = {
            x: 0,
            y: 0
        };
        const directionMapper: {[key: string]: CCoordinate} = {
            ">": directions.right,
            "<": directions.left,
            "^": directions.up,
            "v": directions.down
        };
        const currentPositions = [{...startPosition}, {...startPosition}];

        visited.add(serialization.serialize(startPosition));

        let next = 0;
        lines[0].split("").forEach((c) => {
            currentPositions[next] = directionMapper[c].sum(currentPositions[next]);
            visited.add(serialization.serialize(currentPositions[next]));
            next = (next + 1) % currentPositions.length;
        });
        await outputCallback(visited.size);
    },
    {
        key: "perfect-spherical-houses-in-a-vacuum",
        title: "Perfect Spherical Houses in a Vacuum",
        stars: 2
    }
);
