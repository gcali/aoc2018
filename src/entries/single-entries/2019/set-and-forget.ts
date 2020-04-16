import { entryForFile, simpleOutputCallbackFactory } from "../../entry";
import { parseMemory, execute } from "../../../support/intcode";
import { FixedSizeMatrix } from "../../../support/matrix";
import { getSurrounding, Coordinate, CCoordinate, directions, rotate } from "../../../support/geometry";
import { groupBy, subsequenceGenerator } from "../../../support/sequences";

export type Movement = "R" | "L" | number | "A" | "B" | "C";

interface RobotContext {
    position: Coordinate;
    direction: CCoordinate;
}

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

    public get width() {
        return this.matrix.size.x;
    }

    public get height() {
        return this.matrix.size.y;
    }

    public static fromBuffer(buffer: string[]): Field {
        const fieldLines = buffer.join("").split("\n").filter((e) => e.length > 0);
        return new Field(fieldLines);
    }
    private readonly matrix: FixedSizeMatrix<string>;
    constructor(rows: string[]) {
        const width = rows[0].length;
        const height = rows.length;
        this.matrix = new FixedSizeMatrix<string>({ x: width, y: height });
        const flatData = rows.join("").split("");
        this.matrix.setFlatData(flatData);
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
            const right = this.tryRight(currentPosition);
            if (right !== null) {
                movements.push("R");
                currentPosition = { ...currentPosition, direction: right.direction };
                continue;
            }
            const left = this.tryLeft(currentPosition);
            if (left !== null) {
                movements.push("L");
                currentPosition = { ...currentPosition, direction: left.direction };
                continue;
            }
            break;
        }
        return movements;
    }

    public toString() {
        return this.matrix.toString((e) => e!);
    }

    private isIntersection({ x, y }: Coordinate): boolean {
        return getSurrounding({ x, y }).map((c) => this.get({ x: c.x, y: c.y })).every((e) => e === "#");
    }

    private tryLeft(context: RobotContext): RobotContext | null {
        return this.moveForward({ ...context, direction: rotate(context.direction, "Counterclockwise") });
    }

    private tryRight(context: RobotContext): RobotContext | null {
        return this.moveForward({ ...context, direction: rotate(context.direction, "Clockwise") });
    }

    private moveForward(context: RobotContext): RobotContext | null {
        const newCellPosition = context.direction.sum(context.position);
        const cell = this.matrix.get(newCellPosition);
        if (cell !== "#") {
            return null;
        }
        return { ...context, position: newCellPosition };
    }
}

export const setAndForget = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parseMemory(lines[0]);
        const buffer: string[] = [];
        await execute({
            memory, input: async () => {throw new Error("Why did you call me?"); }, output: async (n) => {
                const c = String.fromCharCode(n);
                buffer.push(c);
            }
        });
        const field = Field.fromBuffer(buffer);
        const alignment = await field.getAlignment();
        // await outputCallback(buffer.join(""));
        await outputCallback(field.toString());
        await outputCallback(`Alignment: ${alignment}`);

    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const memory = parseMemory(lines[0]);
        const buffer: string[] = [];
        await execute({
            memory, input: async () => {throw new Error("Why did you call me?"); }, output: async (n) => {
                const c = String.fromCharCode(n);
                buffer.push(c);
            }
        });
        const field = Field.fromBuffer(buffer);
        const movements = await field.getMovements();

        const serializedMovements = /*movements.join(",");//*/groupBy(movements, 2).map((g) => `${g[0]}${g[1]}`).join("\n");
        await outputCallback(serializedMovements);
        const functions = await findCompressed(movements.map((e) => e.toString()), outputCallback);
        if (functions === null) {
            await outputCallback("Nothing found!");
            return;
        }

        const toSend = [
            functions.replaced,
            functions.aCandidate.join(","),
            functions.bCandidate.join(","),
            functions.cCandidate.join(","),
            "n\n"
        ].join("\n").split("").map((c) =>  c.charCodeAt(0));

        memory[0] = 2;
        let nextSend = 0;

        const answer: number[] = [];

        await outputCallback("Running program");

        await execute({memory, input: async () => {
            if (nextSend >= toSend.length) {
                throw new Error("Why are you asking me for input?");
            }
            return toSend[nextSend++];
        }, output: async (n) => {
            answer.push(n);
        }});

        await outputCallback(answer[answer.length - 1]);
    },
    {key: "set-and-forget", title: "Set and Forget", stars: 2}
);

const findCandidates = <T, >(e: T[], except: T[]): T[][] => {
    let start = 0;
    while (except.indexOf(e[start]) >= 0) {
        start++;
    }
    const results: T[][] = [];
    let end = start + 1;

    while (end < e.length && (end - start) <= 20) {
        if (except.indexOf(e[end]) >= 0) {
            break;
        }
        results.push(e.slice(start, end));
        end++;
    }
    // if (results.length === 0) {
    //     throw new Error("No candidates found");
    // }
    return results;
};

export function smartCompression(movements: string[]): any {
    const aCandidates = findCandidates(movements, []);
    for (const candidate of aCandidates) {
        const aReplaced = replaceCandidate(movements, candidate, "A");
        console.log(movements.join(" "));
        console.log(candidate.join(" "));
        console.log(aReplaced.join(" "));
        const bCandidates = findCandidates(aReplaced, ["A"]);
        for (const bCandidate of bCandidates) {
            const bReplaced = replaceCandidate(aReplaced, bCandidate, "B");
            const cCandidates = findCandidates(bReplaced, ["A", "B"]);
            for (const cCandidate of cCandidates) {
                const finalReplace = replaceCandidate(bReplaced, cCandidate, "C");
                if (finalReplace.filter((e) => e !== "A" && e !== "B" && e !== "C").length > 0) {
                    continue;
                }
                if (finalReplace.length > 20) {
                    continue;
                }
                return finalReplace;
            }
        }
    }
}

export async function findCompressed(
    movements: string[],
    outputCallback: (outputLine: any, shouldClear?: boolean | undefined) => Promise<void>
): Promise<null | {
        replaced: string,
        aCandidate: string[],
        bCandidate: string[],
        cCandidate: string[],
}> {
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
            if (bCandidate.indexOf("A") >= 0) {
                continue;
            }
            const bReplaced = replaceCandidate(aReplaced, bCandidate, "B");
            for (const cCandidate of subsequenceGenerator(bReplaced)) {
                if (isCandidateTooLong(cCandidate)) {
                    continue;
                }
                if (cCandidate.indexOf("A") >= 0 || cCandidate.indexOf("B") >= 0) {
                    continue;
                }
                const cReplaced = replaceCandidate(bReplaced, cCandidate, "C");
                if (cReplaced.filter((e) => ["A", "B", "C"].indexOf(e.toString()) >= 0).length === cReplaced.length) {
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

function isCandidateTooLong(candidate: Array<Movement | string>) {
    return candidate.join(",").length > 20;
}

function replaceCandidate(movements: string[], candidate: Array<Movement | string>, candidateName: string): string[] {
    const serializedMovements = movements.join(",");
    const serializedCandidate = candidate.join(",");
    const re = new RegExp(serializedCandidate, "g");
    const replaced = serializedMovements.replace(re, candidateName);
    const newMovements = replaced.split(",");
    return newMovements;
}
