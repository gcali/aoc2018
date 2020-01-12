import { Coordinate } from "./geometry";
import wu from 'wu';
import { voidIsPromise, isPromise } from './async';

export class FixedSizeMatrix<T> {
    public data: (T | undefined)[];
    constructor(public size: Coordinate) {
        this.data = new Array<(T | undefined)>(size.x * size.y);
    }

    public fill(fillValue: T | undefined) {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = fillValue;
        }
    }

    public setFlatData(a: T[]) {
        if (a.length !== this.data.length) {
            throw new Error("Wrong size!");
        }
        this.data = [...a];
    }
    public get(c: Coordinate): T | undefined {
        const index = this.indexCalculator(c);
        if (index !== null) {
            return this.data[index];
        }
    }

    public findOne(predicate: (cell: T) => boolean): Coordinate | null {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                if (predicate(this.get({ x, y })!)) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    public async onEveryCell<U>(callback: (c: Coordinate, e: T | undefined) => Promise<U | undefined> | void): Promise<U | undefined> {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                const res = callback({ x, y }, this.get({ x, y }));
                if (isPromise(res)) {
                    const awaited = await res;
                    if (awaited !== undefined) {
                        return awaited;
                    }
                }
            }
        }
    }

    public set(c: Coordinate, value: T) {
        const index = this.indexCalculator(c);
        if (index !== null) {
            this.data[index] = value;
        }
    }

    public copy(): FixedSizeMatrix<T> {
        const newMatrix = new FixedSizeMatrix<T>(this.size);
        newMatrix.data = this.data.slice();
        return newMatrix;
    }

    public *overRows() {
        for (let rowIndex = 0; rowIndex < this.size.y; rowIndex++) {
            const startIndex = this.indexCalculator({ x: 0, y: rowIndex });
            const endIndex = this.indexCalculator({ x: this.size.x - 1, y: rowIndex });
            if (startIndex !== null && endIndex !== null) {
                yield this.data.slice(
                    startIndex,
                    endIndex + 1
                );
            }
        }
    }

    private indexCalculator(c: Coordinate): number | null {
        if (c.y < 0 || c.x < 0 || c.x >= this.size.x || c.y >= this.size.y) {
            return null;
        }
        return c.y * this.size.x + c.x;
    }

    public toString(stringifier: (cell: T | undefined) => string): string {
        const serialized = wu(this.overRows()).map(row => row.map(stringifier).join("")).toArray().join("\n");
        return serialized;
    }
}
