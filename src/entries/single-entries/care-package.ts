import { entryForFile } from "../entry";
import { parseMemory, execute } from '../../support/intcode';
import { groupBy } from '../../support/sequences';
import { Coordinate, getBoundaries, diffCoordinate, sumCoordinate } from '../../support/geometry';
import { FixedSizeMatrix } from '../../support/matrix';
import wu from 'wu';
import { setTimeoutAsync } from '../../support/async';

type Tile = "empty" | "wall" | "block" | "paddle" | "ball";

const tileList: Tile[] = ["empty", "wall", "block", "paddle", "ball"]

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

export const carePackage = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parseMemory(lines[0]);
        let output: number[] = [];
        await execute({ memory, input: async () => { throw new Error("No input"); }, output: e => output.push(e) });

        const tiles = parseTiels(output);
        const blocks = tiles.filter(e => e.tile === "block");

        const visualization = visualizeTiles(tiles);

        await outputCallback(visualization);

        await outputCallback("Blocks: ");
        await outputCallback(blocks.length);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parseMemory(lines[0]);
        memory[0] = 2;
        let currentPaddleX = 0;
        let currentBallX = 0;
        let output: number[] = [];
        let tiles: Cell[] = [];
        let score: number = 0;
        await execute({
            memory, input: async () => {
                if (tiles.length > 0) {
                    ({ currentPaddleX, currentBallX } = await updateTileFeedback(tiles, currentPaddleX, currentBallX, score, outputCallback));
                }
                const res = Math.sign(currentBallX - currentPaddleX);
                return res;
            }, output: async e => {
                output.push(e);
                if (output.length === 3) {
                    if (output[0] === -1 && output[1] === 0) { //is score
                        score = output[2];
                        if (tiles.length > 0) {
                            ({ currentPaddleX, currentBallX } = await updateTileFeedback(tiles, currentPaddleX, currentBallX, score, outputCallback));
                        }
                    } else { //is tile
                        const tile = parseGroup(output);
                        const matching = tiles.filter(t => t.coordinates.x === tile.coordinates.x && t.coordinates.y === tile.coordinates.y);
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
    }
);

async function updateTileFeedback(tiles: Cell[], currentPaddleX: number, currentBallX: number, score: number, outputCallback: (outputLine: any, shouldClear?: boolean | undefined) => Promise<void>) {
    const visualization = visualizeTiles(tiles) + `\n\nScore: ${score}`;
    currentPaddleX = tiles.filter(t => t.tile === "paddle")[0].coordinates.x;
    currentBallX = tiles.filter(t => t.tile === "ball")[0].coordinates.x;
    await outputCallback(null);
    await outputCallback(visualization);
    await setTimeoutAsync(5);
    return { currentPaddleX, currentBallX };
}

function visualizeTiles(tiles: Cell[]) {
    const boundaries = getBoundaries(tiles.map(t => t.coordinates));
    const grid = new FixedSizeMatrix<string>(sumCoordinate(boundaries.size, boundaries.topLeft));
    tiles.forEach(t => grid.set(t.coordinates, tileVisualize(t.tile)));
    const visualization = wu(grid.overRows()).map(row => row.join("")).toArray().join("\n");
    return visualization;
}

function parseTiels(output: number[]) {
    return groupBy(output, 3).map(parseGroup);
}
