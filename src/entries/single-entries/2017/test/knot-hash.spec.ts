import "mocha";
import { circleGenerator, reverse } from "../knot-hash";
import { expectSameArrays } from "../../../../support/assertions";

const testLengths = (lengths: number[], result: number[]) => {
        let [circle, state]  = circleGenerator(5);
        lengths.forEach((length) => {
            [circle, state] = reverse(circle, state, length);
        });
        expectSameArrays(result, circle);
};
        // const lengths = [3, 4, 1, 5];

describe("Knot hash", () => {
    it("Should reverse small list, first step", () => {
        testLengths([3], [2, 1, 0, 3, 4]);
    });

    it("Should reverse small list, second step", () => {
        testLengths([3, 4], [4, 3, 0, 1, 2]);
    });
    it("Should reverse small list, third step", () => {
        testLengths([3, 4, 1], [4, 3, 0, 1, 2]);
    });
    it("Should reverse small list, fourth step", () => {
        testLengths([3, 4, 1, 5], [3, 4, 2, 1, 0]);
    });
});

