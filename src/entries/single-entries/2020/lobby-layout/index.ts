import { entryForFile } from "../../../entry";
import {getHexSurrounding, HexCubeCoordinate, pointyHexDirections, serialization, sumHexCoordinates} from "../../../../support/hex-geometry";

type Direction = keyof typeof pointyHexDirections;

const parseLines = (lines: string[]): Direction[][] => {
    return lines.map((line) => {
        const directions: Direction[] = [];
        let modifier: "north" | "south" | null = null;
        for (const token of line) {
            if (token === "n") {
                modifier = "north";
            } else if (token === "s") {
                modifier = "south";
            } else if (token === "e") {
                if (modifier === "north") {
                    directions.push("northEast");
                } else if (modifier === "south") {
                    directions.push("southEast");
                } else {
                    directions.push("east");
                }
                modifier = null;
            } else if (token === "w") {
                if (modifier === "north") {
                    directions.push("northWest");
                } else if (modifier === "south") {
                    directions.push("southWest");
                } else {
                    directions.push("west");
                }
                modifier = null;
            }
        }
        return directions;
    });
};

export const lobbyLayout = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const reference: HexCubeCoordinate = {
            x: 0,
            y: 0,
            z: 0
        };
        const black = new Set<string>();
        const instructions = parseLines(lines);
        for (const instruction of instructions) {
            const tile = instruction.reduce(
                (acc, next) => sumHexCoordinates(acc, pointyHexDirections[next]),
                reference
            );
            const serialized = serialization.serialize(tile);
            if (black.has(serialized)) {
                black.delete(serialized);
            } else {
                black.add(serialized);
            }
        }
        await resultOutputCallback(black.size);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const reference: HexCubeCoordinate = {
            x: 0,
            y: 0,
            z: 0
        };
        let black = new Set<string>();
        const instructions = parseLines(lines);
        for (const instruction of instructions) {
            const tile = instruction.reduce(
                (acc, next) => sumHexCoordinates(acc, pointyHexDirections[next]),
                reference
            );
            const serialized = serialization.serialize(tile);
            if (black.has(serialized)) {
                black.delete(serialized);
            } else {
                black.add(serialized);
            }
        }
        for (let i = 0; i < 100; i++) {
            const interesting = new Set<string>([...black.values()]
                .map(serialization.deserialize)
                .flatMap(getHexSurrounding)
                .map(serialization.serialize)).values();
            const newBlack = new Set<string>();
            for (const tile of interesting) {
                const coordinates = serialization.deserialize(tile);
                const blackNeighbours = getHexSurrounding(coordinates)
                    .map(serialization.serialize)
                    .filter((e) => black.has(e))
                    .length;
                const isBlack = black.has(tile);
                if (isBlack) {
                    if (blackNeighbours > 0 && blackNeighbours <= 2) {
                        newBlack.add(tile);
                    }
                } else {
                    if (blackNeighbours === 2) {
                        newBlack.add(tile);
                    }
                }
            }
            black = newBlack;
        }
        await resultOutputCallback(black.size);
    },
    {
        key: "lobby-layout",
        title: "Lobby Layout",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);
