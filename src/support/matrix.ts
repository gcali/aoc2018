import { Coordinate } from "./geometry";

export class FixedSizeMatrix<T> {
    public data: T[];
    constructor(public size: Coordinate) {
        this.data = new Array<T>(size.x * size.y);
    }

    public setFlatData(a: T[]) {
        if (a.length !== this.data.length) {
            throw new Error("Wrong size!");
        }
        this.data = [...a];
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

    public *overRows() {
        for (let rowIndex = 0; rowIndex < this.size.y; rowIndex++) {
            yield this.data.slice(
                this.indexCalculator({ x: 0, y: rowIndex }),
                this.indexCalculator({ x: this.size.x, y: rowIndex })
            );
        }
    }

    private indexCalculator(c: Coordinate): number {
        return c.y * this.size.x + c.x;
    }
}
