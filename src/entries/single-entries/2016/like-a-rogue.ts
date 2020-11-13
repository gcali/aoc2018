import { entryForFile } from "../../entry";

type Cell = "^" | ".";

const getSafe = (cell: Cell[], index: number): Cell => {
    if (index < 0 || index >= cell.length) {
        return ".";
    }
    return cell[index];
};

const mapCell = (left: Cell, center: Cell, right: Cell): Cell => {
    const total = [left, center, right];
    const traps = total.filter((e) => e === "^").length;
    if (traps === 2) {
        if (right  === "." || left === ".") {
            return "^";
        }
    }
    if (traps === 1) {
        if (left === "^" || right === "^") {
            return "^";
        }
    }
    return ".";
};

const evolve = (line: Cell[]): Cell[] => {
    const result: Cell[] = [];
    for (let i = 0; i < line.length; i++) {
        const left = getSafe(line, i - 1);
        const center = getSafe(line, i);
        const right = getSafe(line, i + 1);
        result.push(mapCell(left, center, right));
    }
    return result;
};

const buildMap = (startLine: Cell[], size: number): Cell[][] => {
    const result: Cell[][] = [startLine];
    for (let i = 1; i < size; i++) {
        result.push(evolve(result[i - 1]));
    }
    return result;
};

const prettify = (cells: Cell[][]): string => {
    return cells.map((line) => line.join("")).join("\n");
};

const countSafe = (cells: Cell[]): number => cells.filter((c) => c === ".").length;

export const likeARogue = entryForFile(
    async ({ lines, outputCallback }) => {
        const result = buildMap(lines[0].split("") as Cell[], 40);
        await outputCallback(prettify(result));
        await outputCallback(result.flatMap((r) => r).filter((e) => e === ".").length);
    },
    async ({ lines, outputCallback }) => {
        let lastLine = lines[0].split("") as Cell[];
        let result: number = countSafe(lastLine);
        const size = 400000;
        for (let i = 1; i < size; i++) {
            lastLine = evolve(lastLine);
            result += countSafe(lastLine);
        }
        await outputCallback(result);
    },
    { key: "like-a-rogue", title: "Like a Rogue", stars: 2}
);
