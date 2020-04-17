import { entryForFile } from "../../entry";
import { parseMemory, execute, Memory } from "../../../support/intcode";
import { FixedSizeMatrix } from "../../../support/matrix";
import { UnknownSizeField } from "../../../support/field";
import { Coordinate, CCoordinate, manhattanDistance } from "../../../support/geometry";
import { exec } from "child_process";

interface BeamOutput {
    field: UnknownSizeField<"#" | ".">;
    size: Coordinate;
}

const left = new CCoordinate(-1, 0);
const right = new CCoordinate(1, 0);

interface RowInfo {
    rowStart: number;
    rowLength: number;
}

type RowMapData = Array<RowInfo | undefined>;

const serializePoint = (c: Coordinate): string => {
    return `${c.x},${c.y}`;
};



export const tractorBeam = entryForFile(
    async ({ lines, outputCallback }) => {
        const memory = parseMemory(lines[0]);
        let howManyPulled = 0;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                const toServe = [x, y];
                let nextToServe = 0;
                await execute({
                    memory,
                    input: async () => toServe[nextToServe++],
                    output: async (n) => howManyPulled += n
                });
            }
        }
        await outputCallback(howManyPulled);
    },
    async ({ lines, outputCallback }) => {
        const memory = parseMemory(lines[0]);

        let startPoint = {x: 3, y: 4};
        const delta = new CCoordinate(1, 1);

        const rowData: RowMapData = [];

        const expectedSize = 100;

        while (true) {
            startPoint = delta.sum(startPoint);
            if (!await isPulled(memory, startPoint)) {
                if (await isPulled(memory, left.sum(startPoint))) {
                    startPoint = left.sum(startPoint);
                } else if (await isPulled(memory, right.sum(startPoint))) {
                    startPoint = right.sum(startPoint);
                } else {
                    throw new Error("Could not find start point");
                }
            }

            console.log("Sure point: " + JSON.stringify(startPoint));

            let rowStart = startPoint;
            while (await isPulled(memory, rowStart)) {
                rowStart = left.sum(rowStart);
            }
            rowStart = right.sum(rowStart);

            console.log("Left start: " + serializePoint(rowStart));

            const lastRowInfo = await setRowData(memory, rowStart, rowData);
            if (
                lastRowInfo.rowLength >= expectedSize &&
                rowStart.x >= expectedSize &&
                rowStart.y >= expectedSize
                ) {
                    const interestingTopRow = rowStart.y - expectedSize + 1;
                    const topRowInfo = rowData[interestingTopRow];
                    if (topRowInfo) {
                        const deltaX = rowStart.x - topRowInfo.rowStart;
                        console.log({
                            top: interestingTopRow,
                            topStart: topRowInfo.rowStart,
                            topLength: topRowInfo.rowLength,
                            delta: deltaX,
                        });
                        if (topRowInfo.rowLength - deltaX >= expectedSize) {
                            await outputCallback({x: rowStart.x, y: interestingTopRow});
                            return;
                        }
                    }
            }
            startPoint = rowStart;
        }

    },
    { key: "tractor-beam", title: "Tractor Beam", stars: 2}
);

const setRowData = async (memory: Memory, rowStart: Coordinate, rowData: RowMapData): Promise<RowInfo> => {
    let length = 0;
    const start = rowStart.x;
    while (await isPulled(memory, rowStart)) {
        length++;
        rowStart = right.sum(rowStart);
    }
    const rowDataEntry = {
        rowStart: start,
        rowLength: length
    };
    rowData[rowStart.y] = rowDataEntry;
    return rowDataEntry;
};

const isRowLongEnough = async (
    memory: Memory,
    startPoint: Coordinate,
    long: number
): Promise<boolean> => {
    for (let i = 0; i < long; i++) {
        if (!await isPulled(memory, startPoint)) {
            return false;
        }
        startPoint = right.sum(startPoint);
    }
    return true;
};

const isPulled = async (memory: Memory, coordinate: Coordinate): Promise<boolean> => {
    const toServe = [coordinate.x, coordinate.y];
    let nextToServe = 0;
    let result = false;
    await execute({
        memory,
        input: async () => toServe[nextToServe++],
        output: async (n) => result = (n === 1)
    });
    return result;
};

const enlarge = async (
    memory: Memory,
    output: BeamOutput,
    toSize: Coordinate
): Promise<void> => {
    const toFill: Coordinate[] = [];
    const newSize = {
        x: Math.max(toSize.x, output.size.x),
        y: Math.max(toSize.y, output.size.y)
    };
    for (let x = Math.max(Math.min(output.size.x, toSize.x) - 1, 0); x < newSize.x; x++) {
        for (let y = Math.max(Math.min(output.size.y, toSize.y) - 1, 0); y < newSize.y; y++) {
            if (x >= output.size.x || y >= output.size.y) {
                toFill.push({x, y});
            }
        }
    }
    await fillField(memory, output, toFill);
    output.size = newSize;

};

const fillField = async (
    memory: Memory,
    output: BeamOutput,
    toFill: Coordinate[]
): Promise<void> => {
    for (const coordinate of toFill) {
        const toServe = [coordinate.x, coordinate.y];
        let nextToServe = 0;
        await execute({
            memory,
            input: async () => toServe[nextToServe++],
            output: async (n) => {
                if (n === 1) {
                    output.field.set(coordinate, "#");
                } else {
                    output.field.set(coordinate, ".");
                }
            }
        });
    }
};
