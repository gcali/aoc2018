import "mocha";

import { expect } from "chai";
import { UlamCalculator } from '../ulam';
import { manhattanDistance, Coordinate } from '../geometry';

describe("ulam", () => {
    it("should calculate correctly base square sizes", () => {
        const calculator = new UlamCalculator();
        const data = [...Array(25).keys()]
        .map(k => k + 1)
        .map(k => {
            if (k === 1) {
                return [k,1];
            } else if (k <= 9) {
                return [k,3];
            } else {
                return [k,5];
            }
        });

        data.forEach(e => {
            expect(calculator.findSquareSize(e[0])).to.equal(e[1], "Fail for " + e);
        })
    });
    it("should find coordinates", () => {
        const expectedData: [number,Coordinate][] = [
            [1, {x: 0, y: 0}],
            [2, {x: 1, y: 0}],
            [3, {x: 1, y: 1}],
            [4, {x: 0, y: 1}],
            [5, {x: -1, y: 1}],
            [6, {x: -1, y: 0}],
            [7, {x: -1, y: -1}],
            [8, {x: 0, y: -1}],
            [9, {x: 1, y: -1}],
            [10, {x: 2, y: -1}],
            [11, {x: 2, y: 0}],
            [12, {x: 2, y: 1}],
            [13, {x: 2, y: 2}],
            [14, {x: 1, y: 2}],
            [25, {x: 2, y: -2}]
        ];

        const ulamCalculator = new UlamCalculator();

        expectedData.forEach(data => {
            expect(manhattanDistance(
                data[1],
                ulamCalculator.getCoordinatesFromValue(data[0])
            )).to.equal(0, "Fail for " + JSON.stringify({...data[1], v: data[0]}));
        })
    });
})