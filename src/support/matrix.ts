import { Coordinate } from "./geometry";

export class FixedSizeMatrix<T> {
    public data: T[];
    constructor(private size: Coordinate) {
        this.data = new Array<T>(size.x * size.y);
    }
    public get(c: Coordinate): T {
        return this.data[this.indexCalculator(c)];
    }

    public set(c: Coordinate, value: T) {
        this.data[this.indexCalculator(c)] = value;
    }

    public copy(): FixedSizeMatrix<T> {
        const newMatrix = new FixedSizeMatrix<T>(this.size);
        newMatrix.data = this.data.slice();
        return newMatrix;
    }

    private indexCalculator(c: Coordinate): number {
        return c.x * this.size.y + c.y;
    }
}
