import "mocha";

import { expect } from 'chai';
import { FixedSizeMatrix } from '../matrix';

describe("Fixed size matrix", () => {
    it("creates a matrix of correct size", () => {
        const data = [[1, 2], [3, 4], [5, 6]];
        const matrix = new FixedSizeMatrix<number>({ x: data[0].length, y: data.length });
        data.forEach((row, rowIndex) => row.forEach((cell, colIndex) => matrix.set({ x: colIndex, y: rowIndex }, cell)));
        const serialized = matrix.toString(i => (i && i.toString()) || "");
        const split = serialized.split("\n");
        expect(split.length).to.equal(data.length);
        expect(split[0].length).to.equal(data[0].length);
    });
    it("serializes correctly", () => {
        const data = ["####", "#..#", "####"];
        const expected = data.join("\n");
        const matrix = new FixedSizeMatrix<string>({ x: 4, y: 3 });
        data.forEach((row, rowIndex) => row.split("").forEach((cell, colIndex) => matrix.set({ x: colIndex, y: rowIndex }, cell)));
        // matrix.setFlatData(expected.split(""));
        expect(matrix.toString(e => e || "")).to.equal(expected);
    });
    it("serialized correctly undefined values", () => {
        const matrix = new FixedSizeMatrix<string | undefined>({ x: 3, y: 1 });
        matrix.set({ x: 0, y: 0 }, "X");
        matrix.set({ x: 1, y: 0 }, undefined);
        matrix.set({ x: 2, y: 0 }, "Y");

        const expected = "X Y";
        const serialized = matrix.toString(e => e ? e : " ");

        expect(serialized).to.equal(expected);
    });
    it("serialized correctly missing values", () => {
        const matrix = new FixedSizeMatrix<string | undefined>({ x: 3, y: 1 });
        matrix.fill(undefined);
        matrix.set({ x: 0, y: 0 }, "X");
        matrix.set({ x: 2, y: 0 }, "Y");

        const expected = "X Y";
        const serialized = matrix.toString(e => e ? e : " ");

        expect(serialized).to.equal(expected);
    });
    it("returns undefined for x < 0", () => {
        const matrix = new FixedSizeMatrix<string>({ x: 1, y: 1 });
        matrix.set({ x: 0, y: 0 }, "Hello!");
        const res = matrix.get({ x: -1, y: 0 });
        expect(res).to.be.undefined;
    });

    it("returns undefined for y < 0", () => {
        const matrix = new FixedSizeMatrix<string>({ x: 1, y: 1 });
        matrix.set({ x: 0, y: 0 }, "Hello!");
        const res = matrix.get({ x: 0, y: -1 });
        expect(res).to.be.undefined;
    });

    it("returns undefined for x > width", () => {
        const matrix = new FixedSizeMatrix<string>({ x: 2, y: 2 });
        matrix.set({ x: 0, y: 0 }, "Hello!");
        matrix.set({ x: 1, y: 0 }, "Hello!");
        matrix.set({ x: 0, y: 1 }, "Hello!");
        matrix.set({ x: 1, y: 1 }, "Hello!");
        const res = matrix.get({ x: 2, y: 0 });
        expect(res).to.be.undefined;
    });

    it("returns undefined for y > width", () => {
        const matrix = new FixedSizeMatrix<string>({ x: 2, y: 2 });
        matrix.set({ x: 0, y: 0 }, "Hello!");
        matrix.set({ x: 1, y: 0 }, "Hello!");
        matrix.set({ x: 0, y: 1 }, "Hello!");
        matrix.set({ x: 1, y: 1 }, "Hello!");
        const res = matrix.get({ x: 0, y: 2 });
        expect(res).to.be.undefined;
    });
});