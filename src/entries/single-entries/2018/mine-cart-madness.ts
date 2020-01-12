import { oldEntryForFile, entryForFile } from "../../entry";
import { Coordinate, sumCoordinate } from "../../../support/geometry";
import { maxNumber } from "../../../support/best";

enum Direction {
    right, down, left, up
}

enum RelativeDirection {
    left, straight, right
}

function relativeDirectionToString(d: RelativeDirection) {
    switch (d) {
        case RelativeDirection.left:
            return "<";
        case RelativeDirection.right:
            return ">";
        case RelativeDirection.straight:
            return "=";
    }
}

function checkCollisions(carts: Cart[]) {
    return carts.reduce(
        (acc: { prev: Cart, collides: boolean } | null, next: Cart): { prev: Cart, collides: boolean } => {
            if (acc && acc.collides) {
                return {
                    prev: acc.prev, collides: acc.collides
                };
            } else if (acc === null) {
                return {
                    prev: next,
                    collides: false
                };
            } else {
                if (acc.prev.compareTo(next) === 0) {
                    return {
                        prev: next,
                        collides: true
                    };
                } else {
                    return {
                        prev: next,
                        collides: false
                    };
                }
            }
        },
        null
    );
}

function directionToString(d: Direction) {
    switch (d) {
        case Direction.right:
            return ">";
        case Direction.left:
            return "<";
        case Direction.down:
            return "v";
        case Direction.up:
            return "^";
    }
}

function stringToDirection(s: string): Direction {
    switch (s) {
        case ">":
            return Direction.right;
        case "<":
            return Direction.left;
        case "v":
            return Direction.down;
        case "^":
            return Direction.up;
        default:
            throw Error("Invalid direction");
    }
}

function nextDirection(orig: Direction, last: RelativeDirection) {
    const newRelativeDirection: RelativeDirection = (last + 1) % 3;
    let directionDelta = 0;
    switch (last) {
        case RelativeDirection.straight:
            directionDelta = 0;
            break;
        case RelativeDirection.left:
            directionDelta = -1;
            break;
        case RelativeDirection.right:
            directionDelta = +1;
            break;
    }
    return {
        newRelativeDirection,
        direction: (orig + directionDelta + 4) % 4
    };
}

type Cell = "/" | "\\" | "|" | "-" | "+" | " ";

class Cart {
    constructor(
        public coordinate: Coordinate,
        public direction: Direction,
        private nextRelative: RelativeDirection = RelativeDirection.left
    ) {
    }

    public compareTo(other: Cart) {
        if (this.coordinate.y === other.coordinate.y) {
            return maxNumber(this.coordinate.x, other.coordinate.x);
        } else {
            return maxNumber(this.coordinate.y, other.coordinate.y);
        }
    }

    public move(cell: Cell) {
        let direction: Direction = Direction.up;
        let relativeDirection = this.nextRelative;
        switch (cell) {
            case "/":
                switch (this.direction) {
                    case Direction.left:
                        direction = Direction.down;
                        break;
                    case Direction.down:
                        direction = Direction.left;
                        break;
                    case Direction.up:
                        direction = Direction.right;
                        break;
                    case Direction.right:
                        direction = Direction.up;
                        break;
                }
                break;
            case "\\":
                switch (this.direction) {
                    case Direction.left:
                        direction = Direction.up;
                        break;
                    case Direction.down:
                        direction = Direction.right;
                        break;
                    case Direction.up:
                        direction = Direction.left;
                        break;
                    case Direction.right:
                        direction = Direction.down;
                        break;
                    default:
                        throw Error("No direction");
                }
                break;
            case "+":
                const next = nextDirection(this.direction, this.nextRelative);
                direction = next.direction;
                relativeDirection = next.newRelativeDirection;
                break;
            default:
                direction = this.direction;
                break;
        }
        let newPosition = this.coordinate;
        switch (direction) {
            case Direction.down:
                newPosition = sumCoordinate(newPosition, { y: 1, x: 0 });
                break;
            case Direction.up:
                newPosition = sumCoordinate(newPosition, { x: 0, y: -1 });
                break;
            case Direction.left:
                newPosition = sumCoordinate(newPosition, { x: -1, y: 0 });
                break;
            case Direction.right:
                newPosition = sumCoordinate(newPosition, { x: 1, y: 0 });
                break;
            default:
                throw Error("No direction");
        }

        return new Cart(newPosition, direction, relativeDirection);

    }
}

function stringToCell(s: string) {
    switch (s) {
        case "/":
        case "-":
        case "|":
        case "+":
        case "\\":
        case " ":
            return s;
        case "<":
        case ">":
            return "-";
        case "^":
        case "v":
            return "|";
        default:
            throw Error("Invalid cell " + s);
    }
}

type Output = Cell | "<" | ">" | "^" | "v" | "x";

export interface Status {
    carts: Cart[];
    grid: Output[][];
}

export const entry = entryForFile(
    async ({ lines, outputCallback, statusCallback, isCancelled }) => {
        const cartDirections = ["<", ">", "^", "v"];
        const fullGrid = lines.map((l) => l.split("").map((c) => cartDirections.indexOf(c) >= 0 ? c : stringToCell(c)));
        let carts: Cart[] = [];
        fullGrid.forEach((line, y) => {
            line.forEach((cell, x) => {
                if (cartDirections.indexOf(cell) >= 0) {
                    carts.push(new Cart({ x, y }, stringToDirection(cell)));
                }
            });
        });
        const grid: Cell[][] = fullGrid.map((l) => l.map((c) => stringToCell(c)));
        carts = carts.sort((a, b) => a.compareTo(b));
        let collisions: ReturnType<typeof checkCollisions> = checkCollisions(carts);
        let iteration = 0;
        while (collisions === null || !collisions.collides) {
            if (isCancelled && isCancelled()) {
                break;
            }
            carts = carts.map((c) => c.move(grid[c.coordinate.y][c.coordinate.x]));
            carts = carts.sort((a, b) => b.compareTo(a));
            const output = grid.map((line) => line.map((c) => c as Output));
            carts.forEach((c) => output[c.coordinate.y][c.coordinate.x] = directionToString(c.direction));
            collisions = checkCollisions(carts);
            if (statusCallback) {
                await statusCallback({
                    carts,
                    grid: output
                });
            }
            // if (++iteration % 100 === 0) {
            await outputCallback("Iteration " + (iteration++) + " done");
            //     break;
            // }
        }
        if (isCancelled && isCancelled()) {
            await outputCallback("Cancelled by user");
        } else {
            await outputCallback(collisions!.prev.coordinate);
        }
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    }
    // async ({lines, outputCallback, statusCallback?: ((status: Status) => void)}) => {
    //     const cartDirections = ["<", ">", "^", "v"];
    //     const fullGrid = lines.map((l) => l.split("").map(
    //     (c) => cartDirections.indexOf(c) >= 0 ? c : stringToCell(c))
    // );
    //     let carts: Cart[] = [];
    //     fullGrid.forEach((line, y) => {
    //         line.forEach((cell, x) => {
    //             if (cartDirections.indexOf(cell) >= 0) {
    //                 carts.push(new Cart({ x, y }, stringToDirection(cell)));
    //             }
    //         });
    //     });
    //     const grid: Cell[][] = fullGrid.map((l) => l.map((c) => stringToCell(c)));
    //     carts = carts.sort((a, b) => a.compareTo(b));
    //     let collisions: ReturnType<typeof checkCollisions> = checkCollisions(carts);
    //     let iteration = 0;
    //     while (collisions === null || !collisions.collides) {
    //         carts = carts.map((c) => c.move(grid[c.coordinate.y][c.coordinate.x]));
    //         carts = carts.sort((a, b) => b.compareTo(a));
    //         const output = grid.map((line) => line.map((c) => c as Output));
    //         carts.forEach((c) => output[c.coordinate.y][c.coordinate.x] = directionToString(c.direction));
    //         collisions = checkCollisions(carts);
    //         if (statusCallback) {
    //             statusCallback({
    //                 carts,
    //                 grid: output
    //             });
    //         }
    //         // if (++iteration % 100 === 0) {
    //         await outputCallback("Iteration " + (iteration++) + " done");
    //         //     break;
    //         // }
    //     }
    //     await outputCallback(collisions!.prev.coordinate);
    // },
    // async ({lines, outputCallback}) => {
    //     throw Error("Not implemented");
    // }
);
