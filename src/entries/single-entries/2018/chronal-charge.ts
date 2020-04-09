import { CustomBest, maxNumber } from "../../../support/best";
import { Coordinate } from "../../../support/geometry";
import { oldEntryForFile, entryForFile } from "../../entry";
import { BigInteger } from "big-integer";
import bigInt from "big-integer";
import { forEachAsync } from "../../../support/async";

class FuelGrid {

    private sumTable: BigInteger[][] | null = null;
    constructor(private seed: number, private outputCallback: (s: any) => void) {
    }

    public getRackID(c: Coordinate) {
        return c.x + 10;
    }

    public populate(size: number) {
        const table: BigInteger[][] = [];
        const originalTable: BigInteger[][] = [];
        let countPositive = 0;
        let countNegative = 0;
        for (let y = 0; y < size; y++) {
            const line: BigInteger[] = [];
            const originalLine: BigInteger[] = [];
            for (let x = 0; x < size; x++) {
                const currentValue = bigInt(this.getFuelStatus({ x, y }));
                originalLine.push(currentValue);
                if (currentValue.lesser(0)) {
                    countNegative++;
                } else if (currentValue.greater(0)) {
                    countPositive++;
                }
                if (currentValue.abs().greater(5)) {
                    throw Error("WTF?");
                }
                let currentSum = currentValue;
                if (x > 0) {
                    currentSum = currentSum.add(line[x - 1]);
                    if (y > 0) {
                        currentSum = currentSum.subtract(table[y - 1][x - 1]);
                    }
                }
                if (y > 0) {
                    currentSum = currentSum.add(table[y - 1][x]);
                }
                line.push(currentSum);
            }
            table.push(line);
            originalTable.push(originalLine);
        }
        this.sumTable = table;
        // this.printTable(originalTable);
        // this.outputCallback("");
        // this.printTable(table);
    }

    public getAreaSum(topLeft: Coordinate, size: Coordinate) {
        if (this.sumTable === null) {
            throw Error("Table not populated!");
        }

        size = {
            x: size.x - 1,
            y: size.y - 1
        };

        let area = this.sumTable[topLeft.y + size.y][topLeft.x + size.x];
        if (topLeft.y - 1 >= 0) {
            area = area.subtract(this.sumTable[topLeft.y - 1][topLeft.x + size.x]);
            if (topLeft.x - 1 >= 0) {
                area = area.add(this.sumTable[topLeft.y - 1][topLeft.x - 1]);
            }
        }
        if (topLeft.x - 1 >= 0) {
            area = area.subtract(this.sumTable[topLeft.y + size.y][topLeft.x - 1]);
        }

        return area;

        // return this.sumTable[topLeft.y + size.y][topLeft.x + size.x]
        //     .subtract(this.sumTable[topLeft.y + size.y][topLeft.x])
        //     .subtract(this.sumTable[topLeft.y][topLeft.x + size.x])
        //     .add(this.sumTable[topLeft.y][topLeft.x]);
    }


    public getFuelStatus(c: Coordinate, throwIfMissing: boolean = false) {
        const id = this.getRackID(c);
        let powerLevel = id * c.y;
        powerLevel += this.seed;
        powerLevel *= id;
        if (powerLevel < 100) {
            powerLevel = 0;
        } else {
            powerLevel = Math.floor(powerLevel / 100) % 10;
        }
        powerLevel -= 5;
        return powerLevel;
    }

    private printTable(table: BigInteger[][]) {
        const output = table.map((line) => {
            return line.map((c) => ("" + c).padStart(8, " ")).join(" ");
        }).join("\n");
        this.outputCallback(output);
    }

    // public getFuelSumForTopLeft(c: Coordinate, cellSize: number) {
    //     let sum = 0;
    //     for (let dx = 0; dx < cellSize; dx++) {
    //         for (let dy = 0; dy < cellSize; dy++) {
    //             sum += this.getFuelStatus({
    //                 x: c.x + dx,
    //                 y: c.y + dy
    //             });
    //         }
    //     }
    //     return sum;
    // }
}

async function main(lines: string[], outputCallback: ((s: any) => void), cellSizes: number[]) {
    const serial = parseInt(lines[0], 10);
    const grid = new FuelGrid(serial, outputCallback);
    const size = 300;
    grid.populate(size);
    const bestPoint = new CustomBest<BigInteger, Coordinate & { iteration: number }>(
        (a, b) => a.subtract(b).toJSNumber()
    );
    await forEachAsync(cellSizes, async (cellSize) => {
        await outputCallback("Iteration " + cellSize);
        for (let x = 0; x < size - (cellSize - 1); x++) {
            for (let y = 0; y < size - (cellSize - 1); y++) {
                bestPoint.add({
                    value: { x, y, iteration: cellSize },
                    key: grid.getAreaSum({ x, y }, { x: cellSize, y: cellSize })
                });
            }
        }
    });
    await outputCallback(
        `Coordinate: ${JSON.stringify(bestPoint.currentBest!.value)} with ${bestPoint.currentBest!.key}`
    );
}

export const entry = entryForFile(
    async ({lines, outputCallback}) => {
        await main(lines, outputCallback, [3]);
    },
    async ({lines, outputCallback}) => {
        const cellSizes: number[] = [];
        for (let i = 1; i < 301; i++) {
            cellSizes.push(i);
        }
        await main(lines, outputCallback, cellSizes);
    },
    { key: "chronal-charge", title: "Chronal Charge", stars: 2, }
);
