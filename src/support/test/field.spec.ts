import "mocha";

import { expect } from "chai";
import { UnknownSizeField } from "../field";
import { manhattanDistance } from "../geometry";

describe("Field", () => {
    it("should create an empty matrix", () => {
        const field = new UnknownSizeField<number>();
        const matrix = field.toMatrix();
        expect(manhattanDistance(matrix.size, { x: 0, y: 0 })).to.equal(0);
    });

    it("should create a matrix of size 3x2", () => {
        const field = new UnknownSizeField<number>();
        field.set({ x: -1, y: -1 }, 1);
        field.set({ x: 1, y: 0 }, 0);
        const matrix = field.toMatrix();
        expect(manhattanDistance(matrix.size, { x: 3, y: 2 })).to.equal(0);
    });
    it("should return only set values", () => {
        const field = new UnknownSizeField<number>();
        field.set({ x: -1, y: -1 }, 1);
        field.set({ x: 1, y: 0 }, 0);
        const matrix = field.toMatrix();
        const existsA = matrix.get({ x: -1, y: -1 });
        const existsB = matrix.get({ x: 1, y: 0 });
        const notExistsA = matrix.get({ x: -1, y: 0 });
        const notExistsB = matrix.get({ x: 1, y: -1 });

        expect(existsA).to.equal(1);
        expect(existsB).to.equal(0);
        expect(notExistsA).to.be.undefined;
        expect(notExistsB).to.be.undefined;
    });
});
