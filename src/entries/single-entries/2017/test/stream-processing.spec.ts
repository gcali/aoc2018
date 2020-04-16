import "mocha";
import { parseGroup, countGarbage } from "../stream-processing";
import { expect } from "chai";
describe("Stream Processing", () => {
    it("should count garbage correctly", () => {
        const testCases: Array<[string, number]> = [
            ["{<>}", 0],
            ["{<random characters>}", 17],
            ["{<<<<>}", 3],
            ["{<{!>}>}", 2],
            ["{<!!>}", 0],
            ["{<!!!>>}", 0],
            ["{<{o\"i!a,<{i<a>}", 10],
        ];

        testCases.forEach((testCase) => {
            const parsed = parseGroup(testCase[0])[0];
            const garbage = countGarbage(parsed);
            expect(garbage).to.equal(testCase[1], "Test failed for " + testCase[0]);
        });


    });
});
