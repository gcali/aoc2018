import "mocha";
import { getOuterAdjacentPositions, getInnerAdjacentPositions, PlanetWithDepth, getCenter, countNeighbourBugs } from "../planet-of-discord";
import { expectSameArrays } from "../../../../support/assertions";
import { expect } from "chai";
import { manhattanDistance } from "../../../../support/geometry";
import { FixedSizeMatrix } from "../../../../support/matrix";

const size = {x: 5, y: 5};

const getPlanet = (depth: number, fill: "#" | "."): PlanetWithDepth => {
    const center = getCenter(size);
    const matrix = new FixedSizeMatrix<"#" | ".">(size);
    matrix.setFlatData([...Array(size.x * size.y).keys()].map((_) => fill));
    matrix.set(center, undefined);
    return {
        depth,
        planet: matrix
    };
};

const getEmptyPlanet = (depth: number) => getPlanet(depth, ".");
const getFullPlanet = (depth: number) => getPlanet(depth, "#");

describe("Planet of Discord", () => {
    it("should find correct outer positions for top-left", () => {
        const positions = getOuterAdjacentPositions({x: 0, y: 0}, size);
        expect(positions).to.have.length(2);

        const found = positions.some((e) => manhattanDistance(e, {x: 2, y: 1}) === 0)
            && positions.some((e) => manhattanDistance(e, {x: 1, y: 2}) === 0);
        expect(found).to.be.true;
    });
    it("should find correct outer positions for top", () => {
        for (let x = 1; x < size.x - 1; x++) {
            const positions = getOuterAdjacentPositions({x, y: 0}, size);
            expect(positions).to.have.length(1);

            const found = positions.some((e) => manhattanDistance(e, {x: 2, y: 1}) === 0);
            expect(found).to.be.true;
        }
    });
    it("should find correct outer positions for top-right", () => {
        const positions = getOuterAdjacentPositions({x: size.x - 1, y: 0}, size);
        expect(positions).to.have.length(2);

        const found = positions.some((e) => manhattanDistance(e, {x: 2, y: 1}) === 0) &&
            positions.some((e) => manhattanDistance(e, {x: 3, y: 2}));
        expect(found).to.be.true;
    });
    it("should find correct outer positions for right", () => {
        for (let y = 1; y < size.y - 1; y++) {
            const positions = getOuterAdjacentPositions({x: size.x - 1, y}, size);
            expect(positions).to.have.length(1);

            const found = positions.some((e) => manhattanDistance(e, {x: 3, y: 2}) === 0);
            expect(found).to.be.true;
        }
    });
    it("should find correct outer positions for bottom-right", () => {
        const positions = getOuterAdjacentPositions({x: size.x - 1, y: size.y - 1}, size);
        expect(positions).to.have.length(2);

        const found = positions.some((e) => manhattanDistance(e, {x: 3, y: 2}) === 0) &&
            positions.some((e) => manhattanDistance(e, {x: 2, y: 3}));
        expect(found).to.be.true;
    });
    it("should find correct outer positions for bottom", () => {
        for (let x = 1; x < size.x - 1; x++) {
            const positions = getOuterAdjacentPositions({x, y: size.y - 1}, size);
            expect(positions).to.have.length(1);

            const found = positions.some((e) => manhattanDistance(e, {x: 2, y: 3}) === 0);
            expect(found).to.be.true;
        }
    });
    it("should find correct outer positions for bottom-left", () => {
        const positions = getOuterAdjacentPositions({x: 0, y: size.y - 1}, size);
        expect(positions).to.have.length(2);

        const found = positions.some((e) => manhattanDistance(e, {x: 2, y: 3}) === 0) &&
            positions.some((e) => manhattanDistance(e, {x: 1, y: 2}));
        expect(found).to.be.true;
    });

    it("should find correct outer positions for left", () => {
        for (let y = 1; y < size.y - 1; y++) {
            const positions = getOuterAdjacentPositions({x: 0, y}, size);
            expect(positions).to.have.length(1);

            const found = positions.some((e) => manhattanDistance(e, {x: 1, y: 2}) === 0);
            expect(found).to.equal(true);
        }
    });

    it("should find correct inner positions for top", () => {
        const positions = getInnerAdjacentPositions({x: 2, y: 1}, size);
        expect(positions.length === 5);
        expect(positions.some((e) => e.y !== 0)).to.be.false;
        const otherValues = positions.map((p) => p.x).sort();
        expectSameArrays(otherValues, [0, 1, 2, 3, 4]);
    });

    it("should find correct inner positions for bottom", () => {
        const positions = getInnerAdjacentPositions({x: 2, y: 3}, size);
        expect(positions.length === 5);
        expect(positions.some((e) => e.y !== size.y - 1)).to.be.false;
        const otherValues = positions.map((p) => p.x).sort();
        expectSameArrays(otherValues, [0, 1, 2, 3, 4]);
    });

    it("should find correct inner positions for left", () => {
        const positions = getInnerAdjacentPositions({x: 1, y: 2}, size);
        expect(positions.length === 5);
        expect(positions.some((e) => e.x !== 0)).to.be.false;
        const otherValues = positions.map((p) => p.y).sort();
        expectSameArrays(otherValues, [0, 1, 2, 3, 4]);
    });

    it("should find correct inner positions for right", () => {
        const positions = getInnerAdjacentPositions({x: 3, y: 2}, size);
        expect(positions.length === 5);
        expect(positions.some((e) => e.x !== size.x - 1)).to.be.false;
        const otherValues = positions.map((p) => p.y).sort();
        expectSameArrays(otherValues, [0, 1, 2, 3, 4]);
    });

    it("should find correct neighbours for main with inner", () => {
        const main = getFullPlanet(0);
        const inner = getFullPlanet(1);

        const center = getCenter(main.planet.size);

        const corners = [
            {x: 0, y: 0},
            {x: 0, y: size.y - 1},
            {x: size.x - 1, y: 0},
            {x: size.x - 1, y: size.y - 1}
        ];

        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                if (manhattanDistance({x, y}, center) === 0) {
                    continue;
                }
                const count = countNeighbourBugs({x, y}, main, undefined, inner);
                if (corners.some((c) => manhattanDistance(c, {x, y}) === 0)) {
                    expect(count).to.equal(2);
                } else if (x === 0 || x === size.x - 1 || y === 0 || y === size.y - 1) {
                    expect(count).to.equal(3);
                } else if (manhattanDistance({x, y}, center) === 1) {
                    expect(count).to.equal(8);
                } else {
                    expect(count).to.equal(4);
                }
            }
        }
    });
});
