import { CCoordinate, Coordinate, directionList, getFullSurrounding, manhattanDistance } from "../../../../support/geometry";
import { FixedSizeMatrix } from "../../../../support/matrix";
import { entryForFile, ResultOutputCallback } from "../../../entry";
import { buildVisualizer, ISeatingSystemVisualizer } from "./visualizer";

type Cell = "#" | "L" | ".";
export type Grid = FixedSizeMatrix<Cell>;

const parseLines = (lines: string[]): Grid => {
    const size = {x: lines[lines.length - 1].length, y: lines.length};
    const grid = new FixedSizeMatrix<Cell>(size);
    const flatData = lines
        .map((e) => e.length !== size.x ? e.slice(0, size.x) : e)
        .join("")
        .split("")
        .map((e) => e as Cell);
    grid.setFlatData(flatData);
    return grid;
};

const iterate = async (grid: Grid): Promise<Grid> => {
    return grid.map<Cell>((element, coordinate) => {
        if (element === ".") {
            return element;
        }
        const adjacent = getFullSurrounding(coordinate)
            .map((c) => grid.get(c))
            .filter((e) => e);
        const occupied = adjacent.filter((e) => e === "#").length;

        if (element === "L") {
            if (occupied === 0) {
                return "#";
            }
        } else if (element === "#") {
            if (occupied >= 4) {
                return "L";
            }
        }
        return element!;
    });
};

const findFirstSeat = (grid: Grid, start: Coordinate, direction: CCoordinate): Cell | null => {
    start = direction.sum(start);
    while (true) {
        const cell = grid.get(start);
        if (!cell) {
            return null;
        }
        if (cell !== ".") {
            return cell;
        }
        start = direction.sum(start);
    }
};

const realIterate = async (grid: Grid): Promise<Grid> => {
    const g = grid.map<Cell>((element, coordinate) => {
        if (element === ".") {
            return element;
        }
        const adjacent = directionList.map((d) => findFirstSeat(grid, coordinate, d)).filter((e) => e) as Cell[];
        const occupied = adjacent.filter((e) => e === "#").length;

        if (element === "L") {
            if (occupied === 0) {
                return "#";
            }
        } else if (element === "#") {
            if (occupied >= 5) {
                return "L";
            }
        }
        return element!;
    });
    return g;
};

const execute = async (
    lines: string[],
    visualizer: ISeatingSystemVisualizer,
    resultOutputCallback: ResultOutputCallback,
    // pause: Pause,
    isQuickRunning: boolean,
    iterationCallback: typeof iterate) => {
        const visited = new Set<string>();
        let grid = parseLines(lines);
        await visualizer.setup(grid.size);
        if (!isQuickRunning) {
            // await outputCallback(grid.toString(e => e || " "));
            await visualizer.update(grid);
            // await pause();
        }
        while (true) {
            const serialized = grid.simpleSerialize();
            if (visited.has(serialized)) {
                const occupied = grid.reduce<number>((acc, next) => acc + (next.cell === "#" ? 1 : 0), 0);
                // if (!isQuickRunning) {
                //     await outputCallback(occupied, true);
                //     await outputCallback(grid.toString(e => e || " "));
                // }
                await visualizer.update(grid);
                await resultOutputCallback(occupied);
                return;
            }
            visited.add(serialized);
            grid = await iterationCallback(grid);
            await visualizer.update(grid);
            // if (!isQuickRunning) {
                // await outputCallback(grid.toString(e => e || " "), true);
                // await pause();
            // }
        }
    };

export const seatingSystem = entryForFile(
    async ({
        lines,
        // outputCallback,
        resultOutputCallback,
        pause,
        isQuickRunning,
        screen,
        setAutoStop
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        await execute(lines, visualizer, resultOutputCallback, /*pause,*/ isQuickRunning, iterate);
    },
    async ({
        lines,
        // outputCallback,
        resultOutputCallback,
        pause,
        isQuickRunning,
        screen,
        setAutoStop
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        await execute(lines, visualizer, resultOutputCallback, /*pause,*/ isQuickRunning, realIterate);
    },
    {
        key: "seating-system",
        title: "Seating System",
        stars: 2,
        supportsQuickRunning: true,
        suggestedDelay: 20,
        customComponent: "pause-and-run",
        embeddedData: true
    }
);
