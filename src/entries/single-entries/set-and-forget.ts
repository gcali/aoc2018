import { entryForFile } from "../entry";
import { parseMemory, execute } from '../../support/intcode';
import { FixedSizeMatrix } from '../../support/matrix';
import { getSurrounding, Coordinate, CCoordinate, directions, rotate } from '../../support/geometry';
import { groupBy, subsequenceGenerator } from '../../support/sequences';
import { CircularDoubleLinkedNode } from '../../support/data-structure';

export type Movement = "R" | "L" | number | "A" | "B" | "C";

interface RobotContext {
    position: Coordinate,
    direction: CCoordinate
};

function getRobotDirection(s: string): CCoordinate | null {
    switch (s) {
        case "^":
            return directions.up;
        case "<":
            return directions.left;
        case "v":
            return directions.down;
        case ">":
            return directions.right;
        default:
            return null;
    }
}

export class Field {
    private readonly matrix: FixedSizeMatrix<string>;
    constructor(rows: string[]) {
        const width = rows[0].length;
        const height = rows.length;
        this.matrix = new FixedSizeMatrix<string>({ x: width, y: height });
        const flatData = rows.join("").split("");
        this.matrix.setFlatData(flatData);
    }

    public static fromBuffer(buffer: string[]): Field {
        const fieldLines = buffer.join("").split("\n").filter(e => e.length > 0);
        return new Field(fieldLines);
    }

    public get width() {
        return this.matrix.size.x;
    }

    public get height() {
        return this.matrix.size.y;
    }

    public onEveryCell<T>(callback: (c: Coordinate, e: string) => Promise<T | undefined>): Promise<T | undefined> {
        return this.matrix.onEveryCell(async (c, e) => await callback(c, e!));
    }

    public get(c: Coordinate): string {
        return this.matrix.get(c)!;
    }

    public async getIntersections() {
        const intersections: Coordinate[] = [];
        await this.onEveryCell(async ({ x, y }, cell) => {
            if (cell && cell === "#") {
                const isIntersection = this.isIntersection({ x, y });
                if (isIntersection) {
                    intersections.push({ x, y });
                }
            }
        });
        return intersections;
    }

    private isIntersection({ x, y }: Coordinate): boolean {
        return getSurrounding({ x, y }).map(c => this.get({ x: c.x, y: c.y })).every(e => e === "#");
    }

    public async getAlignment(): Promise<number> {
        const intersections: Coordinate[] = await this.getIntersections();
        const alignment = intersections.reduce((acc, next) => acc + next.x * next.y, 0);
        return alignment;
    }

    public async getMovements(shouldDebug?: boolean): Promise<Movement[]> {
        let currentPosition: RobotContext | undefined = await this.onEveryCell(async (c, cell) => {
            if (cell) {
                const direction = getRobotDirection(cell);
                if (direction !== null) {
                    return { position: c, direction };
                }
            }
        });
        if (!currentPosition) {
            throw new Error("Could not find the robot");
        }
        this.matrix.set(currentPosition.position, "#");
        const movements: Movement[] = [];
        let currentSteps = 0;
        let shouldClear = true;
        while (true) {
            const forward = this.moveForward(currentPosition);
            if (forward !== null) {
                currentSteps++;
                if (shouldDebug) {
                    console.log(this.toString());
                    console.log("-----")
                }
                const isNextIntersection = this.isIntersection(forward.position);
                if (shouldClear) {
                    this.matrix.set(currentPosition.position, ".");
                }
                shouldClear = !isNextIntersection;
                currentPosition = forward;
                continue;
            }
            if (currentSteps > 0) {
                movements.push(currentSteps);
                currentSteps = 0;
            }
            const left = this.tryLeft(currentPosition);
            if (left !== null) {
                movements.push("L");
                currentPosition = { ...currentPosition, direction: left.direction };
                continue;
            }
            const right = this.tryRight(currentPosition);
            if (right !== null) {
                movements.push("R");
                currentPosition = { ...currentPosition, direction: right.direction };
                continue;
            }
            break;
        }
        return movements;
    }

    private tryLeft(context: RobotContext): RobotContext | null {
        return this.moveForward({ ...context, direction: rotate(context.direction, "Clockwise") });
    }

    private tryRight(context: RobotContext): RobotContext | null {
        return this.moveForward({ ...context, direction: rotate(context.direction, "Counterclockwise") });
    }

    private moveForward(context: RobotContext): RobotContext | null {
        const newCellPosition = context.direction.sum(context.position);
        const cell = this.matrix.get(newCellPosition);
        if (cell !== "#") {
            return null;
        }
        return { ...context, position: newCellPosition };
    }

    public toString() {
        return this.matrix.toString(e => e!);
    }
}

export const setAndForget = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parseMemory(lines[0]);
        const buffer: string[] = [];
        await execute({
            memory, input: async () => 2, output: async (n) => {
                const c = String.fromCharCode(n);
                buffer.push(c);
            }
        });
        const field = Field.fromBuffer(buffer);
        const alignment = await field.getAlignment();
        await outputCallback(field.toString());
        await outputCallback(`Alignment: ${alignment}`);

    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parseMemory(lines[0]);
        const buffer: string[] = [];
        await execute({
            memory, input: async () => 2, output: async (n) => {
                const c = String.fromCharCode(n);
                buffer.push(c);
            }
        });
        const field = Field.fromBuffer(buffer);
        const movements = await field.getMovements();

        // const result = await findCompressed(movements, outputCallback);
        // if (result !== null) {
        //     await outputCallback(result);
        // } else {
        //     await outputCallback("Nothing found :(");
        // }
        const serializedMovements = groupBy(movements, 2).map(g => `${g[0]}${g[1]}`).join(",");
        await outputCallback(serializedMovements);
        await outputCallback(serializedMovements.length);
    }
);

async function findCompressed(movements: Movement[], outputCallback: (outputLine: any, shouldClear?: boolean | undefined) => Promise<void>) {
    let currentIteration = 0;
    const totalIterations = movements.length * (movements.length + 1) / 2;
    for (const aCandidate of subsequenceGenerator(movements)) {
        await outputCallback("Iteration " + (++currentIteration) + " over " + totalIterations);
        if (isCandidateTooLong(aCandidate)) {
            continue;
        }
        const aReplaced = replaceCandidate(movements, aCandidate, "A");
        for (const bCandidate of subsequenceGenerator(aReplaced)) {
            if (isCandidateTooLong(bCandidate)) {
                continue;
            }
            const bReplaced = replaceCandidate(aReplaced, bCandidate, "B");
            for (const cCandidate of subsequenceGenerator(bReplaced)) {
                if (isCandidateTooLong(cCandidate)) {
                    continue;
                }
                const cReplaced = replaceCandidate(bReplaced, cCandidate, "C");
                if (cReplaced.filter(e => ["A", "B", "C"].indexOf(e.toString()) >= 0).length === cReplaced.length) {
                    await outputCallback("Found!");
                    return {
                        replaced: cReplaced.join(","),
                        aCandidate,
                        bCandidate,
                        cCandidate
                    };
                }
            }
        }
    }
    return null;
}

function isCandidateTooLong(candidate: Movement[]) {
    return candidate.join(",").length > 20;
}

function replaceCandidate(movements: Movement[], candidate: Movement[], candidateName: string): Movement[] {
    const serializedMovements = movements.join(",");
    const serializedCandidate = candidate.join(",");
    const replaced = serializedMovements.replace(serializedCandidate, candidateName);
    const newMovements = replaced.split(",");
    return newMovements as Movement[];
}
