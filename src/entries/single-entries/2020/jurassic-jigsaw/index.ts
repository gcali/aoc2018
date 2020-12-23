import { factorial } from "../../../../support/algebra";
import { Counter, DefaultListDictionaryString } from "../../../../support/data-structure";
import { Coordinate } from "../../../../support/geometry";
import { buildGroupsFromSeparator } from "../../../../support/sequences";
import { entryForFile } from "../../../entry";

interface Tile {
    id: number;
    tile: string[][];
    matches: Array<{
        matchesWith: number;
        operations: TileOperations
    }>;
    isPlaced: boolean;
}

const rotate = (tile: Tile): Tile => {
    return {
        ...tile,
        tile: tile.tile.map((row, rowIndex) => row.map((col, colIndex) => {
            return tile.tile[colIndex][tile.tile.length - rowIndex - 1];
        }))
    };
};

const verticalMatch = (a: Tile, b: Tile): boolean => {
    for (let i = 0; i < a.tile.length; i++) {
        if (a.tile[a.tile.length - 1][i] !== b.tile[0][i]) {
            return false;
        }
    }
    return true;
};

const horizontalMatch = (a: Tile, b: Tile): boolean => {
    for (let i = 0; i < a.tile.length; i++) {
        if (a.tile[i][a.tile.length - 1] !== b.tile[i][0]) {
            return false;
        }
    }
    return true;
};

interface TileOperations {
    rotations: number;
    flipped: boolean;
    inverted: boolean;
    direction: "horizontal" | "vertical";
}
interface MatchResult {
    a: TileOperations;
    b: TileOperations;
}

const match = (a: Tile, b: Tile): MatchResult | false => {
    const easyMatch = (x: Tile, y: Tile): Omit<Omit<TileOperations, "rotations">, "flipped"> | false => {
        if (verticalMatch(x, y)) {
            return {direction: "vertical", inverted: false};
        }
        if (verticalMatch(y, x)) {
            return {direction: "vertical", inverted: true};
        }
        if (horizontalMatch(x, y)) {
            return {direction: "horizontal", inverted: false};
        }
        if (horizontalMatch(y, x)) {
            return {direction: "horizontal", inverted: true};
        }
        return false;
    };
    const makeMatch = (
        rot: number,
        flipped: boolean,
        inverted: boolean,
        direction: "horizontal" | "vertical"
    ): TileOperations => {
        return {
            rotations: (rot + 1) % 4, flipped, inverted, direction
        };
    };
    for (let j = 0; j < 4; j++) {
        b = rotate(b);
        const flippedB = flip(b);
        let result = easyMatch(a, b);
        if (result) {
            return {
                a: makeMatch(0, false, result.inverted, result.direction),
                b: makeMatch(j, false, result.inverted, result.direction)
            };
        }

        result = easyMatch(a, flippedB);
        if (result) {
            return {
                a: makeMatch(0, false, result.inverted, result.direction),
                b: makeMatch(j, true, result.inverted, result.direction)
            };
        }

    }
    return false;
};

const horizontalFlip = (tile: Tile): Tile => rotate(rotate(flip(tile)));

const flip = (tile: Tile): Tile => {
    return {
        ...tile,
        tile: tile.tile.map((row, rowIndex) => row.map((col, colIndex) => {
            return tile.tile[tile.tile.length - rowIndex - 1][colIndex];
        }))
    };
};

const parseLines = (lines: string[]): Tile[] => {
    const result: Tile[] = [];
    for (const group of buildGroupsFromSeparator(lines, (e) => e.trim().length === 0)) {
        result.push({
            id: parseInt(group[0].split(" ")[1], 10),
            tile: group.slice(1).map((line) => line.split("")),
            matches: [],
            isPlaced: false
        });
    }
    return result;
};

const toString = (tile: Tile): string => {
    return tile.tile.map((e) => e.join("")).join("\n");
};

const adjust = (fixed: Tile, movable: Tile, direction: "horizontal" | "vertical"): Tile | null => {
    const matcher = direction === "horizontal" ? horizontalMatch : verticalMatch;
    for (let i = 0; i < 4; i++) {
        if (matcher(fixed, movable)) {
            return movable;
        }
        const flipped = flip(movable);
        if (matcher(fixed, flipped)) {
            return flipped;
        }
        movable = rotate(movable);
    }
    return null;
};

interface TileIndex {[key: number]: Tile; }

export const jurassicJigsaw = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        for (const a of input) {
            for (const b of input) {
                if (a.id < b.id) {
                    const isMatching = match(a, b);
                    if (isMatching) {
                        a.matches.push({
                            matchesWith: b.id,
                            operations: isMatching.a
                        });
                        b.matches.push({
                            matchesWith: a.id,
                            operations: isMatching.b
                        });
                    }
                }
            }
        }
        const corners = input.filter((k) => k.matches.length === 2);
        await resultOutputCallback(corners.reduce((acc, next) => acc * next.id, 1));
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        for (const a of input) {
            for (const b of input) {
                if (a.id < b.id) {
                    const isMatching = match(a, b);
                    if (isMatching) {
                        a.matches.push({
                            matchesWith: b.id,
                            operations: isMatching.a
                        });
                        b.matches.push({
                            matchesWith: a.id,
                            operations: {...isMatching.b, inverted: !isMatching.b.inverted}
                        });
                    }
                }
            }
        }
        const tileIndex = input.reduce((acc, next) => {
            acc[next.id] = next;
            return acc;
        }, {} as TileIndex);

        const corners = input.filter((k) => k.matches.length === 2);
        let topLeftCorner = corners.sort((a, b) => a.id - b.id)[0];
        // this is not generic!
        topLeftCorner = flip(horizontalFlip(topLeftCorner));
        console.log(toString(topLeftCorner));
        const size = Math.sqrt(input.length);
        let currentLine: Tile[] = [topLeftCorner];
        topLeftCorner.isPlaced = true;
        const result: Tile[][] = [];
        while (result.length < size) {
            if (currentLine.length > 0 && currentLine.length < size) {
                const lastIndex = currentLine.length - 1;
                const current = currentLine[lastIndex];
                const candidates = current.matches.map((t) => tileIndex[t.matchesWith]).filter((e) => !e.isPlaced);
                let target: Tile | null = null;
                for (const tile of candidates) {
                    target = adjust(current, tile, "horizontal");
                    if (target) {
                        break;
                    }
                }
                if (!target) {
                    throw new Error("Could not find horizontal tile");
                }
                currentLine.push(target);
                target.isPlaced = true;
            } else if (currentLine.length === size) {
                result.push(currentLine);
                currentLine = [];
            } else if (currentLine.length === 0 && result.length === 0) {
                throw new Error("Cannot write second line without first");
            } else {
                if (currentLine.length !== 0) {
                    throw new Error("What didn't I consider? " + currentLine.length);
                }
                const lastIndex = result.length - 1;
                const current = result[lastIndex][0];
                const candidates = current.matches.map((t) => tileIndex[t.matchesWith]).filter((e) => !e.isPlaced);
                let target: Tile | null = null;
                for (const tile of candidates) {
                    target = adjust(current, tile, "vertical");
                    if (target) {
                        break;
                    }
                }
                if (!target) {
                    throw new Error("Could not find vertical tile");
                }
                currentLine.push(target);
                target.isPlaced = true;
            }
        }
        let maxiTile: Tile = {
            id: -1,
            isPlaced: true,
            matches: [],
            tile: []
        };
        let currentMaxiLine: string[] = [];
        const tileSize = result[0][0].tile.length;
        for (let y = 0; y < size; y++) {
            for (let innerY = 0; innerY < tileSize; innerY++) {
                if (innerY === 0 || innerY === tileSize - 1) {
                    continue;
                }
                for (let x = 0; x < size; x++) {
                    const inner = result[y][x].tile[innerY];
                    currentMaxiLine = currentMaxiLine.concat(inner.slice(1, -1));
                }
                maxiTile.tile.push(currentMaxiLine);
                currentMaxiLine = [];
            }
        }
        const seaMonsterPattern =
`                  #
#    ##    ##    ###
 #  #  #  #  #  #   `.split("\n");
        const seaMonsterSize = {y: seaMonsterPattern.length, x: seaMonsterPattern[0].length};
        const clearSeaMonster = (tile: string[][], corner: Coordinate): void => {
            const nestedTileSize = {y: tile.length, x: tile[0].length};
            if (corner.x + seaMonsterSize.x > nestedTileSize.x || corner.y + seaMonsterSize.y > nestedTileSize.y) {
                return;
            }
            for (let y = 0; y < seaMonsterPattern.length; y++) {
                for (let x = 0; x < seaMonsterPattern[0].length; x++) {
                    if (seaMonsterPattern[y][x] === "#")  {
                        tile[y + corner.y][x + corner.x] = "O";
                    }
                }
            }
        };

        const seaMonsterMatch = (tile: string[][], corner: Coordinate): boolean => {
            const nestedTileSize = {y: tile.length, x: tile[0].length};
            if (corner.x + seaMonsterSize.x > nestedTileSize.x || corner.y + seaMonsterSize.y > nestedTileSize.y) {
                return false;
            }
            for (let y = 0; y < seaMonsterPattern.length; y++) {
                for (let x = 0; x < seaMonsterPattern[0].length; x++) {
                    if (seaMonsterPattern[y][x] === "#" && tile[y + corner.y][x + corner.x] !== "#") {
                        return false;
                    }
                }
            }
            return true;
        };
        const countMonsters = (tile: string[][]): number => {
            let seaMonsterCount = 0;
            for (let y = 0; y < tile.length; y++) {
                for (let x = 0; x < tile[0].length; x++) {
                    if (seaMonsterMatch(tile, {x, y})) {
                        seaMonsterCount++;
                    }
                }
            }
            return seaMonsterCount;
        };
        let bestTile: Tile | null = null;
        for (let i = 0; i < 4; i++) {
            const current = countMonsters(maxiTile.tile);
            if (current > 0) {
                bestTile = maxiTile;
                break;
            }
            const currentFlipped = countMonsters(flip(maxiTile).tile);
            if (currentFlipped > 0) {
                bestTile = maxiTile;
                break;
            }
            maxiTile = rotate(maxiTile);
        }
        if (!bestTile) {
            throw new Error("Didn't find");
        }
        for (let y = 0; y < bestTile.tile.length; y++) {
            for (let x = 0; x < bestTile.tile[0].length; x++) {
                if (seaMonsterMatch(bestTile.tile, {x, y})) {
                    clearSeaMonster(bestTile.tile, {x, y});
                }
            }
        }
        await outputCallback(toString(bestTile));
        await resultOutputCallback(
            bestTile.tile
                .map((e) => e.join(""))
                .join("")
                .split("")
                .filter((t) => t === "#")
                .length
        );
    },
    {
        key: "jurassic-jigsaw",
        title: "Jurassic Jigsaw",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);
