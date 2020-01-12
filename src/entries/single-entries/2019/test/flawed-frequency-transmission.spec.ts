import "mocha";

import { expect } from "chai";
import { Pattern, applyPattern, applyPatternIteratively } from '../flawed-frequency-transmission';

describe("Pattern", async () => {
    it("should be cyclic", () => {
        const pattern = Pattern.default();
        const length = pattern.length;
        const base = pattern.get(0, 0);
        const outOfBounds = pattern.get(length * 2, 0);
        expect(outOfBounds).to.equal(base);
    });

    it("should keep base pattern on position 0", () => {
        const pattern = Pattern.default();
        const first = pattern.get(0, 0);
        const second = pattern.get(1, 0);
        expect(first).to.be.not.equal(second);
    });

    it("should duplicate base pattern on position 1, first two still different", () => {
        const pattern = Pattern.default();
        const first = pattern.get(0, 1);
        const second = pattern.get(1, 1);
        expect(first).to.be.not.equal(second);
    });

    it("should duplicate base pattern on position 1, second and third equal", () => {
        const pattern = Pattern.default();
        const first = pattern.get(1, 1);
        const second = pattern.get(2, 1);
        expect(first).to.be.equal(second);
    });

    it("should duplicate base pattern on position 1, third and fourth not equal again", () => {
        const pattern = Pattern.default();
        const first = pattern.get(2, 1);
        const second = pattern.get(3, 1);
        expect(first).not.to.be.equal(second);
    });

    it("should triplicate base pattern on position 2, third and fourth equal", () => {
        const pattern = Pattern.default();
        const first = pattern.get(2, 3);
        const second = pattern.get(3, 3);
        expect(first).not.to.be.equal(second);
    });

    it("should check first phase on base pattern works", () => {
        const pattern = Pattern.default();
        const baseList = [1, 2, 3, 4, 5, 6, 7, 8];
        const expected = "48226158";

        const transformed = applyPattern(baseList, pattern);
        expect(transformed.map(e => e.toString()).join("")).to.equal(expected);

    });

    it("should check second phase on base pattern", () => {
        const expected = "34040438";
        const pattern = Pattern.default();
        const baseList = [1, 2, 3, 4, 5, 6, 7, 8];

        const transformed = applyPattern(applyPattern(baseList, pattern), pattern);
        expect(transformed.map(e => e.toString()).join("")).to.equal(expected);

    });

    it("should check third phase on base pattern", async () => {
        const expected = "03415518";
        const pattern = Pattern.default();
        const baseList = [1, 2, 3, 4, 5, 6, 7, 8];
        const transformed = await applyPatternIteratively(baseList, pattern, 3);
        expect(transformed.map(e => e.toString()).join("")).to.equal(expected);
    });

});