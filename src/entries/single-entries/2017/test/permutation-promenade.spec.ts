import "mocha";
import { programListGenerator, dance } from '../permutation-promenade';
import { expectSameArrays } from '../../../../support/assertions';

describe("Permutation Promenade", () => {
    it("Should execute spin", () => {
        const programs = programListGenerator(5);
        const result = dance(["s1"], programs);
        expectSameArrays(result, ["e","a","b","c","d"]);
    });
    it("Should execute exchange", () => {
        const programs = programListGenerator(5);
        const result = dance(["s1", "x3/4"], programs);
        expectSameArrays(result, ["e","a","b","d","c"]);
    });
    it("Should execute partner", () => {
        const programs = programListGenerator(5);
        const result = dance(["s1", "x3/4", "pe/b"], programs);
        expectSameArrays(result, ["b","a","e","d","c"]);
    });
});