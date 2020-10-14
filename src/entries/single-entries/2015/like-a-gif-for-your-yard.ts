import { entryForFile } from "../../entry";
import { setTimeoutAsync } from "../../../support/async";
import { FixedSizeMatrix } from "../../../support/matrix";
import { getSurrounding, manhattanDistance, getFullSurrounding } from "../../../support/geometry";

type Field = FixedSizeMatrix<"#" | ".">;

const parseField = (lines: string[]): Field => {
    const size = { x: lines[0].length, y: lines.length };
    const field = new FixedSizeMatrix<"#" | ".">(size);
    field.setFlatData(lines.flatMap((l) => l.split("").map((e) => e as "#" | ".")));
    return field;
};

const iterateGame = (field: Field, leaveCornersOn: boolean = false): Field => {
    const newField = field.copy();
    field.onEveryCell((coordinate, cell) => {
        if (leaveCornersOn &&
            (manhattanDistance(coordinate, { x: 0, y: 0 }) === 0
                || manhattanDistance(coordinate, { x: 0, y: field.size.y - 1 }) === 0
                || manhattanDistance(coordinate, { x: field.size.x - 1, y: 0 }) === 0
                || manhattanDistance(coordinate, { x: field.size.x - 1, y: field.size.y - 1 }) === 0)
        ) {
            return;
        }
        const onNeigbours = getFullSurrounding(coordinate)
            .map((c) => field.get(c))
            .filter((e) => e === "#")
            .length;
        if (cell === "#") {
            if (onNeigbours !== 2 && onNeigbours !== 3) {
                newField.set(coordinate, ".");
            }
        } else if (cell === ".") {
            if (onNeigbours === 3) {
                newField.set(coordinate, "#");
            }
        }
    });
    return newField;
};

export const likeAGifForYourYard = entryForFile(
    async ({ lines, outputCallback }) => {
        const field = parseField(lines);
        let iteration = field;
        const steps = 100;
        for (let i = 0; i < steps; i++) {
            iteration = iterateGame(iteration);
        }
        await outputCallback(iteration.reduce(
            (acc, next) => acc + (next.cell === "#" ? 1 : 0),
            0
        ));
    },
    async ({ lines, outputCallback }) => {
        const field = parseField(lines);
        let iteration = field;
        const steps = 100;
        for (let i = 0; i < steps; i++) {
            iteration = iterateGame(iteration, true);
        }
        await outputCallback(iteration.reduce(
            (acc, next) => acc + (next.cell === "#" ? 1 : 0),
            0
        ));
    },
    { key: "like-a-gif-for-your-yard", title: "Like a GIF For Your Yard", stars: 2 }
);
