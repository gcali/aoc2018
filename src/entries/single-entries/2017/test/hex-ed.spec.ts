import "mocha";
import { applyDirections, Direction } from '../hex-ed';
import { expect } from 'chai';
import { hexManhattanDistance } from '../../../../support/hex-geometry';

const center = {
    x: 0,
    y: 0,
    z: 0
};

describe("Hex Ed", () => {
    it("Should get right end position for small example", () => {
        const directions: Direction[] = ["ne", "ne", "ne"];
        const resultPosition = applyDirections(center, directions);

        expect(resultPosition.x).to.equal(3);
        expect(resultPosition.y).to.equal(0);
        expect(resultPosition.z).to.equal(-3);
    });

    it("Should get right distance for small example", () => {
        const directions: Direction[] = ["ne", "ne", "ne"];
        const resultPosition = applyDirections(center, directions);
        const resultDistance = hexManhattanDistance(center, resultPosition);
        expect(resultDistance).to.equal(3);

    });

    it("Should get right distance for loop", () => {
        const resultPosition = applyDirections(center, ["ne","ne","sw","sw"]);
        const resultDistance = hexManhattanDistance(center, resultPosition);
        expect(resultDistance).to.equal(0);
    });
});