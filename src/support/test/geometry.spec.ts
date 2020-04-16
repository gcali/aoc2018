import "mocha";
import { expect } from "chai";
import { getBoundaries, getRanges, manhattanDistance } from "../geometry";

describe("Boundaries", () => {

    it("should get offset boundaries", () => {
        const coords = [{ x: 1, y: 0 }, { x: 3, y: 3 }];
        const boundaries = getBoundaries(coords);
        expect(boundaries.size.x).to.equal(3);
        expect(boundaries.size.y).to.equal(4);
        expect(boundaries.topLeft.x).equal(1);
        expect(boundaries.topLeft.y).equal(0);
    });

    it("should get max offset ranges", () => {
        const coords = [{ x: 1, y: 0 }, { x: 3, y: 4 }];
        const ranges = getRanges(coords);
        expect(ranges.maxX.currentBest).to.equal(3);
        expect(ranges.maxY.currentBest).to.equal(4);
    });

    it("should get min offset ranges", () => {
        const coords = [{ x: 1, y: 0 }, { x: 3, y: 4 }];
        const ranges = getRanges(coords);
        expect(ranges.minX.currentBest).to.equal(1);
        expect(ranges.minY.currentBest).to.equal(0);
    });

    it("should have 0 size for empty list", () => {
        expect(manhattanDistance(getBoundaries([]).size, { x: 0, y: 0 })).to.equal(0);
    });

});
