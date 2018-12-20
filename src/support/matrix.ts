import { Coordinate } from "./geometry";

export class FixedSizeMatrix<T> {
    data: T[];
    constructor(private size: Coordinate) {
        this.data = new Array<T>(size.x * size.y);
    }

    private indexCalculator(c: Coordinate): number {
        return c.x * this.size.y + c.y;
    }
    public get(c: Coordinate): T {
        return this.data[this.indexCalculator(c)];
    }

    public set(c: Coordinate, value: T) {
        this.data[this.indexCalculator(c)] = value;
    }

    public copy(): FixedSizeMatrix<T> {
        let newMatrix = new FixedSizeMatrix<T>(this.size);
        newMatrix.data = this.data.slice();
        return newMatrix;
    }
}