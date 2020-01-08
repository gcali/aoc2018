import { entryForFile } from "../entry";
import { FixedSizeMatrix } from '../../support/matrix';

import * as geometry from "../../support/geometry";
import { Coordinate, CCoordinate, rotate, Rotation } from '../../support/geometry';
import { execute, parseMemory } from '../..//support/intcode';
import { ascending } from '../../support/best';
import wu from 'wu';

type Color = "Black" | "White";

type Cell = "#" | ".";


interface Step {
    coordinate: Coordinate;
    color: Color;
}

function deserializeRotation(n: number): Rotation {
    if (n === 1) {
        return "Clockwise";
    } else {
        return "Counterclockwise";
    }
}


function serializeColor(c: Color): number {
    return c === "White" ? 1 : 0;
}

function deserializeColor(n: number): Color {
    return n === 1 ? "White" : "Black";
}


export const spacePolice = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        let currentDirection = geometry.directions.up;
        let currentPos = { x: 0, y: 0 };

        const steps: Step[] = [];

        const input = async () => {
            const filtered = steps.filter(e => e.coordinate.x === currentPos.x && e.coordinate.y === currentPos.y);
            if (filtered.length === 0) {
                return serializeColor("Black");
            }
            return serializeColor(filtered[filtered.length - 1].color);
        }

        let isPaint = true;

        const output = (n: number) => {
            if (isPaint) {
                steps.push({ coordinate: currentPos, color: deserializeColor(n) });
                isPaint = false;
            } else {
                const rotation = deserializeRotation(n);
                currentDirection = rotate(currentDirection, rotation);
                currentPos = currentDirection.sum(currentPos);
                isPaint = true;
            }
        }

        const memory = parseMemory(lines[0]);

        await execute({ memory, input, output, close: async () => await outputCallback("Closing down") });

        const sorted = steps.map((e, i) => ({ e, i })).sort((a, b) => (geometry.ascendingCompare(a.e.coordinate, b.e.coordinate) === 0 ? ascending(a.i, b.i) : geometry.ascendingCompare(a.e.coordinate, b.e.coordinate)) * -1).map(e => e.e);
        let last: Step | null = null;
        const distinct: Step[] = [];
        sorted.forEach(s => {
            if (last === null || geometry.ascendingCompare(last.coordinate, s.coordinate) !== 0) {
                distinct.push(s);
                last = s;
            }
        });

        await outputCallback("How many: " + distinct.length);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        let currentDirection = geometry.directions.up;
        let currentPos = { x: 0, y: 0 };

        const steps: Step[] = [{ color: "White", coordinate: currentPos }];

        const input = async () => {
            const filtered = steps.filter(e => e.coordinate.x === currentPos.x && e.coordinate.y === currentPos.y);
            if (filtered.length === 0) {
                return serializeColor("Black");
            }
            return serializeColor(filtered[filtered.length - 1].color);
        }

        let isPaint = true;

        const output = (n: number) => {
            if (isPaint) {
                steps.push({ coordinate: currentPos, color: deserializeColor(n) });
                isPaint = false;
            } else {
                const rotation = deserializeRotation(n);
                currentDirection = rotate(currentDirection, rotation);
                currentPos = currentDirection.sum(currentPos);
                isPaint = true;
            }
        }

        const memory = parseMemory(lines[0]);

        await execute({ memory, input, output, close: async () => await outputCallback("Closing down") });

        const sorted = steps.map((e, i) => ({ e, i })).sort((a, b) => (geometry.ascendingCompare(a.e.coordinate, b.e.coordinate) === 0 ? ascending(a.i, b.i) : geometry.ascendingCompare(a.e.coordinate, b.e.coordinate)) * -1).map(e => e.e);
        let last: Step | null = null;
        const distinct: Step[] = [];
        sorted.forEach(s => {
            if (last === null || geometry.ascendingCompare(last.coordinate, s.coordinate) !== 0) {
                distinct.push(s);
                last = s;
            }
        });

        const boundaries = geometry.getBoundaries(sorted.map(s => s.coordinate));
        const grid = new FixedSizeMatrix<Cell>(boundaries.size);
        for (let x = 0; x < grid.size.x; x++) {
            for (let y = 0; y < grid.size.y; y++) {
                grid.set({ x: x, y: grid.size.y - y }, ".");
            }
        }
        steps.forEach(s => {
            const c = geometry.diffCoordinate(s.coordinate, boundaries.topLeft);
            grid.set(
                { x: c.x, y: c.y },
                s.color === "Black" ? "." : "#"
            );
        });
        const outRows = wu(grid.overRows()).map(row => row.reverse().join("")).toArray();

        for (const row of outRows) {
            await outputCallback(row);
        }

    }
);