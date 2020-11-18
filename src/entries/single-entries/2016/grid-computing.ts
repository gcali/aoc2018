import { BinaryHeap } from "priorityqueue/lib/cjs/BinaryHeap";
import { PriorityQueue } from "priorityqueue/lib/cjs/PriorityQueue";
import { Queue } from "../../../support/data-structure";
import { CCoordinate, Coordinate, directionList, directions, getSurrounding, manhattanDistance } from "../../../support/geometry";
import { hexManhattanDistance } from "../../../support/hex-geometry";
import { FixedSizeMatrix } from "../../../support/matrix";
import { entryForFile } from "../../entry";

interface Node {
    c: Coordinate;
    used: number;
    available: number;
}

type Field = FixedSizeMatrix<Node>;

interface FullField {
    field: Field;
    target: Coordinate;
    steps: number;
}

const parseLines = (lines: string[]): Node[] => {
    const parseCoordinates = (token: string): Coordinate => {
        const startFrom = token.indexOf("-") + 1;
        const [x, y] = token.substr(startFrom).split("-").map((e) => parseInt(e.substr(1), 10));
        return {x, y};
    };
    const parseSize = (token: string): number => parseInt(token.slice(0, -1), 10);
    const parseLine = (line: string): Node | null => {
        if (!line.includes("dev")) {
            return null;
        }
        const tokens = line.split(" ").filter((e) => e);
        return {
            c: parseCoordinates(tokens[0]),
            used: parseSize(tokens[2]),
            available: parseSize(tokens[3])
        };
    };
    return lines.map(parseLine).filter((l) => l !== null) as Node[];
};

const createMatrix = (nodes: Node[]): Field => {
    const size = {x: 0, y: 0};
    for (const node of nodes) {
        size.x = Math.max(size.x, node.c.x);
        size.y = Math.max(size.y, node.c.y);
    }
    size.x++;
    size.y++;
    const matrix = new FixedSizeMatrix<Node>(size);
    for (const node of nodes) {
        matrix.set(node.c, node);
    }
    return matrix;
};

const move = (fullField: FullField, from: Coordinate, to: Coordinate): FullField => {
    const original = fullField.field;
    const result = original.copy();
    const fromNode = result.get(from);
    const toNode = result.get(to);
    if (!fromNode || !toNode) {
        throw new Error("Node didn't exist");
    }
    if (!isViable(fromNode, toNode)) {
        throw new Error("Could not move");
    }
    result.set(from, {...fromNode, used: 0, available: fromNode.used + fromNode.available});
    result.set(to, {...toNode, used: toNode.used + fromNode.used, available: toNode.available - fromNode.used});
    const target = manhattanDistance(fromNode.c, fullField.target) === 0 ? toNode.c : fullField.target;
    return {...fullField, field: result, target};
};

const getValidMoves = (fullField: FullField): Array<{from: Coordinate; to: Coordinate}> => {
    const result: Array<{from: Coordinate; to: Coordinate}> = [];
    fullField.field.onEveryCellSync((c, node) => {
        if (node) {
            if (node.used === 0) {
                return;
            }
            const neighbours = getSurrounding(c)
                .map((coords) => fullField.field.get(coords))
                .filter((e) => e) as Node[];
            for (const neighbour of neighbours) {
                if (isViable(node, neighbour)) {
                    result.push({from: node.c, to: neighbour.c});
                }
            }
        }
    });
    return result;
};

const isViable = (from: Node, to: Node): boolean => {
    return from.used > 0 && from.used <= to.available;
};

const serializer = (fullField: FullField): string => {
    return fullField.field.toString((cell) => {
        if (!cell) {
            throw new Error("Invalid node");
        }
        const neighbours = getSurrounding(cell.c);
        if (cell.used === 0) {
            return "_";
        }
        const canMove = neighbours
            .map((e) => fullField.field.get(e))
            .filter((e) => e)
            .reduce((acc, next) => acc || isViable(cell, next!), false);
        const isTarget = manhattanDistance(cell.c, fullField.target) === 0;
        if (canMove) {
            return isTarget ? "G" : ".";
        }
        return isTarget ? "g" : "#";
    });
};

const fullSerializer = async (fullField: FullField): Promise<string> => {
    const result: string[] = [`t:${fullField.target.x}.${fullField.target.y}`];
    await fullField.field.onEveryCell((c, n) => {
        if (n) {
            result.push(`${c.x}.${c.y}.${n.used}.${n.available}`);
        }
    });
    return result.join("|");
};

class FieldPQ extends BinaryHeap<FullField> {
    constructor(myPosition: Coordinate) {
        super({comparator: (a, b) => {
            const targetDistance = manhattanDistance(a.target, myPosition) - manhattanDistance(b.target, myPosition);
            if (targetDistance !== 0) {
                return targetDistance;
            }
            const movablesA = getValidMoves(a)
                .map((e) => ({move: e, distance: manhattanDistance(e.from, a.target)}))
                .sort((x, y) => x.distance - y.distance)[0];
            const movablesB = getValidMoves(b)
                .map((e) => ({move: e, distance: manhattanDistance(e.from, b.target)}))
                .sort((x, y) => x.distance - y.distance)[0];
            if (!movablesA && !movablesB) {
                return 0;
            }
            if (!movablesA) {
                return 1;
            }
            return movablesA.distance - movablesB.distance;
        }
    });

    }
}

const mapInput = (command: string | null): CCoordinate | null => {
    if (command === null) {
        return null;
    }
    switch (command.toLowerCase()) {
        case "j":
            return directions.down;
        case "k":
            return directions.up;
        case "h":
            return directions.left;
        case "l":
            return directions.right;
    }
    return null;
};

export const gridComputing = entryForFile(
    async ({ lines, outputCallback }) => {
        const input = parseLines(lines);
        let count = 0;
        for (let i = 0; i < input.length; i++) {
            for (let j = i + 1; j < input.length; j++) {
                if (isViable(input[i], input[j]) || isViable(input[j], input[i])) {
                    count++;
                }
            }
        }
        await outputCallback(count);
    },
    async ({ lines, outputCallback, additionalInputReader }) => {
        if (!additionalInputReader) {
            await outputCallback("Could not run the program, need additional input");
            return;
        }
        const myPosition = {x: 0, y: 0};
        const matrix = createMatrix(parseLines(lines));
        const target: Coordinate = {x: matrix.size.x - 1, y: 0};
        let fullField = {field: matrix, target, steps: 0};
        let currentPosition = matrix.findOne((node) => node.available > node.used);
        if (!currentPosition) {
            await outputCallback("Invalid input");
            return;
        }

        const oldCommands: CCoordinate[] = [];
        const oldStates: Array<{field: FullField; position: Coordinate}> = [];
        while (true) {
            await outputCallback(null);
            await outputCallback(serializer(fullField) + "\n" + fullField.steps);
            if (manhattanDistance(fullField.target, myPosition) === 0) {
                await outputCallback("You've done it!");
                return;
            }
            // await outputCallback(fullField.steps);
            let input: CCoordinate | null = null;
            input = oldCommands.pop() || null;
            if (input === null) {
                const rawInput = await additionalInputReader.read();
                if (rawInput === null) {
                    await outputCallback("Closing down");
                    return;
                }
                if (rawInput === "b" && oldStates.length > 0) {
                    const old = oldStates.pop()!;
                    fullField = old.field;
                    currentPosition = old.position;
                    continue;
                } else if (rawInput && rawInput.startsWith("loop")) {
                    const times = rawInput.includes("-") ? parseInt(rawInput.split("-")[1], 10) : 1;
                    for (let i = 0; i < times; i++) {
                        oldCommands.push(directions.up);
                        oldCommands.push(directions.left);
                        oldCommands.push(directions.left);
                        oldCommands.push(directions.down);
                        oldCommands.push(directions.right);
                    }
                    continue;
                } else if (rawInput === "start") {
                    for (let i = 0; i < 7; i++) {
                        oldCommands.push(directions.right);
                    }
                    for (let i = 0; i < 20; i++) {
                        oldCommands.push(directions.up);
                    }
                    for (let i = 0; i < 6; i++) {
                        oldCommands.push(directions.left);
                    }
                    oldCommands.push(directions.up);
                }
                input = mapInput(rawInput);
            }
            if (!input) {
                await outputCallback("Invalid command");
                continue;
            }
            const from = input.sum(currentPosition);
            if (!from.isInBounds(matrix.size)) {
                await outputCallback("Invalid direction");
                continue;
            }
            oldStates.push({field: fullField, position: currentPosition});
            fullField = {...move(fullField, from, currentPosition), steps: fullField.steps + 1};
            currentPosition = from;
        }
    },
    { key: "grid-computing", title: "Grid Computing", hasAdditionalInput: true, stars: 2}
);
