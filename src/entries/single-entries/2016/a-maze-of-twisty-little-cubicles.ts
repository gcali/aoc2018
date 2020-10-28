import { Coordinate, getSurrounding, manhattanDistance } from '../../../support/geometry';
import { calculateDistances } from '../../../support/labyrinth';
import { FixedSizeMatrix } from '../../../support/matrix';
import { entryForFile } from "../../entry";

const countParity = (n: number): 0 | 1 => {
    let parity: (0 | 1) = 0;
    while (n !== 0) {
        n = (n-1) & n;
        parity = (parity ^ 1) as (0 | 1);
    }
    return parity;
}

type Tile = "#" | ".";

const calculatorBuilder = (secretNumber: number): ((c: Coordinate) => Tile) => {
    return (c: Coordinate) => {
        const value = (c.x + c.y)**2 + 3*c.x + c.y + secretNumber;
        const result = countParity(value) === 0 ? "." : "#";
        return result;
    };
}

export const aMazeOfTwistyLittleCubicles = entryForFile(
    async ({ lines, outputCallback }) => {
        const calculator = calculatorBuilder(parseInt(lines[0], 10));
        // const calculator = calculatorBuilder(10);
        const target = {x: 31, y: 39};
        // const target = {x: 7, y: 4};
        const maze = calculateDistances<Tile>(
            c => (c.x < 0 || c.y < 0) ? undefined : calculator(c),
            (a, b) => (a.distance || 0) + manhattanDistance(a.coordinate, b),
            c => getSurrounding(c).filter(e => e.x >= 0 && e.y >= 0).filter(e => calculator(e) === "."),
            {x: 1, y: 1},
            c => manhattanDistance(c.coordinate, target) === 0
        );

        await outputCallback(maze.map(target));

    },
    async ({ lines, outputCallback }) => {
        const calculator = calculatorBuilder(parseInt(lines[0], 10));
        // const calculator = calculatorBuilder(10);
        const target = {x: 31, y: 39};
        // const target = {x: 7, y: 4};
        const maze = calculateDistances<Tile>(
            c => (c.x < 0 || c.y < 0) ? undefined : calculator(c),
            (a, b) => (a.distance || 0) + manhattanDistance(a.coordinate, b),
            c => getSurrounding(c).filter(e => e.x >= 0 && e.y >= 0).filter(e => calculator(e) === "."),
            {x: 1, y: 1},
            c => (c.distance && c.distance > 50) || false
        );

        // let count = 0;
        // maze.list.filter(e => e.cell === "." && e.distance && e.distance <= 50).forEach(() => count++)
        await outputCallback(JSON.stringify(maze.list.filter(e => e.distance !== null && e.distance <= 50).length));

        const field = new FixedSizeMatrix<Tile | number>({x: 60, y: 60});
        for (let x = 0; x < 60; x++) {
            for (let y = 0; y < 60; y++) {
                const tile = calculator({x,y});
                if (tile === "#") {
                    field.set({x,y}, tile);
                } 
                else {
                    field.set({x,y}, maze.map({x,y}) || ".");
                }
            }
        }
        await outputCallback(field.toString(e => {
            if (e === "#" || e === ".") {
                return ` ${e} `;
            } else if (e) {
                if (e < 10) {
                    return ` ${e} `;
                } else {
                    return ` ${e}`;
                }
            } else {
                return "   ";
            }
        }))
    },
    { key: "a-maze-of-twisty-little-cubicles", title: "A Maze of Twisty Little Cubicles", stars: 2}
);