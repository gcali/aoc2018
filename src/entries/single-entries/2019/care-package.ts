import { Drawable, entryForFile, ScreenPrinter } from "../../entry";
import { parseMemory, execute } from "../../../support/intcode";
import { groupBy } from "../../../support/sequences";
import { Coordinate, getBoundaries, diffCoordinate, sumCoordinate, scalarCoordinates, serialization } from "../../../support/geometry";
import { FixedSizeMatrix } from "../../../support/matrix";
import wu from "wu";

type Tile = "empty" | "wall" | "block" | "paddle" | "ball";

const tileList: Tile[] = ["empty", "wall", "block", "paddle", "ball"];

interface Cell {
    tile: Tile;
    coordinates: Coordinate;
}

function tileSerializer(t: Tile): number {
    return tileList.indexOf(t);
}

function tileDeserializer(n: number): Tile {
    return tileList[n];
}

function parseGroup(e: number[]): Cell {
    return {
        tile: tileDeserializer(e[2]),
        coordinates: {
            x: e[0],
            y: e[1]
        }
    };
}

function tileVisualize(t: Tile): string {
    switch (t) {
        case "ball":
            return "o";
        case "block":
            return "*";
        case "empty":
            return " ";
        case "paddle":
            return "-";
        case "wall":
            return "#";
    }
}

function tileColor(t: Tile): string {
    switch (t) {
        case "ball":
            return "white";
        case "block":
            return "black";
        case "empty":
            return "transparent";
        case "paddle":
            return "yellow";
        case "wall":
            return "white";
    }
}

export const carePackage = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled, screen }) => {
        const memory = parseMemory(lines[0]);
        const output: number[] = [];
        await execute({ memory, input: async () => { throw new Error("No input"); }, output: (e) => output.push(e) });

        const tiles = parseTiels(output);
        const blocks = tiles.filter((e) => e.tile === "block");

        if (screen) {
            const printer = await screen.requireScreen({x: 300, y: 300});
            const visualization = screenMapTiles(tiles, {x: 300, y: 300});
            printer.replace(visualization);
        } else {
            const visualization = visualizeTiles(tiles);
            await outputCallback(visualization);
        }

        await outputCallback("Blocks: ");
        await outputCallback(blocks.length);
    },
    async ({ lines, outputCallback, pause, isCancelled, screen }) => {
        const memory = parseMemory(lines[0]);
        memory[0] = 2;
        let currentPaddleX = 0;
        let currentBallX = 0;
        let output: number[] = [];
        const tiles: Cell[] = [];
        let score: number = 0;
        let printer: ScreenPrinter | undefined;
        if (screen) {
            printer = await screen.requireScreen({x: 300, y: 300});
        }
        await execute({
            memory, input: async () => {
                if (tiles.length > 0) {
                    ({ currentPaddleX, currentBallX } =
                        await updateTileFeedback(
                            tiles, currentPaddleX, currentBallX, score, outputCallback, pause, printer
                        )

                    );
                }
                const res = Math.sign(currentBallX - currentPaddleX);
                return res;
            }, output: async (e) => {
                output.push(e);
                if (output.length === 3) {
                    if (output[0] === -1 && output[1] === 0) { // is score
                        score = output[2];
                        if (tiles.length > 0) {
                            ({ currentPaddleX, currentBallX } =
                                await updateTileFeedback(
                                    tiles, currentPaddleX, currentBallX, score, outputCallback, pause, printer
                                )
                            );
                        }
                    } else { // is tile
                        const tile = parseGroup(output);
                        const matching =
                            tiles.filter((t) =>
                                t.coordinates.x === tile.coordinates.x &&
                                t.coordinates.y === tile.coordinates.y
                            );
                        if (matching.length > 0) {
                            matching[0].tile = tile.tile;
                        } else {
                            tiles.push(tile);
                        }
                    }
                    output = [];
                }
            }
        });
        await outputCallback(score);
    },
    { key: "care-package", title: "Care Package", stars: 2}
);

async function updateTileFeedback(
    tiles: Cell[],
    currentPaddleX: number,
    currentBallX: number,
    score: number,
    outputCallback: (outputLine: any, shouldClear?: boolean | undefined) => Promise<void>,
    pause: () => Promise<void>,
    screen?: ScreenPrinter
) {
    currentPaddleX = tiles.filter((t) => t.tile === "paddle")[0].coordinates.x;
    currentBallX = tiles.filter((t) => t.tile === "ball")[0].coordinates.x;
    await outputCallback(null);
    if (screen) {
        await screen.replace(screenMapTiles(tiles, {x: 300, y: 300}));
        await outputCallback(`Score: ${score}`);
    } else {
        const visualization = visualizeTiles(tiles) + `\n\nScore: ${score}`;
        await outputCallback(visualization);
    }
    await pause();
    return { currentPaddleX, currentBallX };
}

function visualizeTiles(tiles: Cell[]) {
    const boundaries = getBoundaries(tiles.map((t) => t.coordinates));
    const grid = new FixedSizeMatrix<string>(sumCoordinate(boundaries.size, boundaries.topLeft));
    tiles.forEach((t) => grid.set(t.coordinates, tileVisualize(t.tile)));
    const visualization = wu(grid.overRows()).map((row) => row.join("")).toArray().join("\n");
    return visualization;
}

function screenMapTiles(tiles: Cell[], size: Coordinate): Drawable[] {
    const boundaries = getBoundaries(tiles.map((t) => t.coordinates));
    const sizes = {x: Math.floor(size.x / boundaries.size.x), y: Math.floor(size.y / boundaries.size.y)};
    const squareSize = Math.min(sizes.x, sizes.y);
    if (squareSize === 0) {
        return [];
    }

    return tiles.map((tile) => {
        let coordinates = {x: tile.coordinates.x * squareSize, y: tile.coordinates.y * squareSize};
        let padding: number = 0;
        if (squareSize >= 6) {
            const maxPadding = Math.floor(squareSize / 4);
            padding = Math.min(maxPadding, 4);
        }
        coordinates = sumCoordinate(coordinates, {x: padding, y: padding});
        const drawableSize = {x: squareSize - 2 * padding, y: squareSize - 2 * padding};
        return {
            id: serialization.serialize(tile.coordinates),
            color: tileColor(tile.tile),
            type: "rectangle",
            c: coordinates,
            size: drawableSize
        } as Drawable;
    });
}

function parseTiels(output: number[]) {
    return groupBy(output, 3).map(parseGroup);
}
