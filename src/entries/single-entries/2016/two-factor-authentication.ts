import { Coordinate } from "../../../support/geometry";
import { FixedSizeMatrix } from "../../../support/matrix";
import { entryForFile } from "../../entry";

type Cell = "#" | ".";

type Field = FixedSizeMatrix<Cell>;

const size = {x: 50, y: 6};

const empty = (): Field => {
    const field = new FixedSizeMatrix<Cell>(size);
    field.fill(".");
    return field;
};

const rect = (rectangle: Coordinate, field: Field): Field => {
    const result = empty();
    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            if (x < rectangle.x && y < rectangle.y) {
                result.set({x, y}, "#");
            } else {
                result.set({x, y}, field.get({x, y}));
            }
        }
    }
    return result;
};

const rotateRow = (row: number, by: number, field: Field): Field => {
    const result = empty();
    field.onEveryCell((c, e) => {
        const x = c.y === row ? (c.x + by) % size.x : c.x;
        result.set({x, y: c.y}, e);
    });
    return result;
};

const rotateColumn = (column: number, by: number, field: Field): Field => {
    const result = empty();
    field.onEveryCell((c, e) => {
        const y = c.x === column ? (c.y + by) % size.y : c.y;
        result.set({x: c.x, y}, e);
    });
    return result;
};

const execute = (line: string, field: Field): Field => {
    const tokens = line.split(" ");
    if (tokens[0] === "rect") {
        const [x, y] = tokens[1].split("x").map((e) => parseInt(e, 10));
        return rect({x, y}, field);
    } else if (tokens[0] === "rotate") {
        const by = parseInt(tokens[4], 10);
        const el = parseInt(tokens[2].split("=")[1], 10);
        if (tokens[1] === "column") {
            return rotateColumn(el, by, field);
        } else {
            return rotateRow(el, by, field);
        }
    }
    throw new Error("Invalid operation " + line);
};

export const twoFactorAuthentication = entryForFile(
    async ({ lines, outputCallback }) => {
        let field: Field = empty();
        for (const line of lines) {
            field = execute(line, field);
        }
        let count = 0;
        field.onEveryCell((c, e) => {
            if (e === "#") {
                count++;
            }
        });

        await outputCallback(count);

    },
    async ({ lines, outputCallback }) => {
        let field: Field = empty();
        for (const line of lines) {
            field = execute(line, field);
        }
        await outputCallback(field.toString((e) => e!));
    },
    { key: "two-factor-authentication", title: "Two-Factor Authentication", stars: 2}
);
