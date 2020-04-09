import { entryForFile } from "../../entry";
import { UnknownSizeField } from "../../../support/field";
import { NotImplementedError } from "../../../support/error";
import { Coordinate, CCoordinate, directions, rotate } from "../../../support/geometry";
import { aMazeOfTwistyTrampolinesAllAlike } from "./a-maze-of-twisty-trampolines-all-alike";
import { FixedSizeMatrix } from "../../../support/matrix";

type Field = UnknownSizeField<string>;

const parse = (lines: string[]): Field => {
    const sizeY = lines.length;
    lines = lines.map((line) => line.trim());
    const lineLengths = lines.map((line) => line.length);
    if (
        lineLengths.reduce((acc, next) => Math.max(acc, next))
        !== lineLengths.reduce((acc, next) => Math.min(acc, next))) {
        throw new Error("Invalid input, line lengths are not all the same");
    }
    const sizeX = lineLengths[0];
    const flatData = lines.flatMap((line) => line.split(""));
    const matrix = new FixedSizeMatrix<string>({ x: sizeX, y: sizeY });
    matrix.setFlatData(flatData);
    const field = new UnknownSizeField<string>();
    matrix.onEveryCell((coordinate, cell) => field.set(coordinate, cell!));
    return field;
};

interface VirusCarrier {
    position: Coordinate;
    direction: CCoordinate;
}

export const sporificaVirus = entryForFile(
    async ({ lines, outputCallback }) => {
        const field = parse(lines);
        const startSize = field.toMatrix().size;
        const midX = Math.floor(startSize.x / 2);
        const midY = Math.floor(startSize.y / 2);
        const virus: VirusCarrier = {
            position: { x: midX, y: midY },
            direction: directions.up
        };

        const total = 10 ** 4;

        let infectionCount = 0;

        for (let i = 0; i < total; i++) {
            const cell = field.get(virus.position);
            if (cell === "#") {
                field.set(virus.position, ".");
                virus.direction = rotate(virus.direction, "Clockwise");
            } else {
                field.set(virus.position, "#");
                virus.direction = rotate(virus.direction, "Counterclockwise");
                infectionCount++;
            }
            virus.position = virus.direction.sum(virus.position);
            // await outputCallback(field.toMatrix().toString((e) => e || " ") + "\n");
        }

        await outputCallback(infectionCount);
    },
    async ({ lines, outputCallback }) => {
        const field = parse(lines);
        const startSize = field.toMatrix().size;
        const midX = Math.floor(startSize.x / 2);
        const midY = Math.floor(startSize.y / 2);
        const virus: VirusCarrier = {
            position: { x: midX, y: midY },
            direction: directions.up
        };

        const total = 10 ** 7;

        let infectionCount = 0;

        for (let i = 0; i < total; i++) {
            const cell = field.get(virus.position);
            if (cell === "#") {
                field.set(virus.position, "F");
                virus.direction = rotate(virus.direction, "Clockwise");
            } else if (cell === "." || !cell) {
                field.set(virus.position, "W");
                virus.direction = rotate(virus.direction, "Counterclockwise");
            } else if (cell === "W") {
                field.set(virus.position, "#");
                infectionCount++;
            } else if (cell === "F") {
                field.set(virus.position, ".");
                virus.direction = rotate(rotate(virus.direction, "Counterclockwise"), "Counterclockwise");
            }
            virus.position = virus.direction.sum(virus.position);
            // await outputCallback(field.toMatrix().toString((e) => e || " ") + "\n");
        }

        await outputCallback(infectionCount);
    },
    { key: "sporifica-virus", title: "Sporifica Virus", stars: 2, }
);
