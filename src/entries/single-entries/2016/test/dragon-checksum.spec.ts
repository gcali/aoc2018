import { expect } from 'chai';
import "mocha";
import { checksum, dragonEverything, dragonStep } from '../dragon-checksum';

describe("Dragon Checksum", () => {
    it("Should apply dragon step to 1", () => {
        const given = "1";
        const when = dragonStep(given);
        expect(when).to.equal("100");
    });

    it("Should apply dragon step to 0", () => {
        const given = "0";
        const when = dragonStep(given);
        expect(when).to.equal("001");
    });

    it("Should apply dragon step to 11111", () => {
        const given = "11111";
        const when = dragonStep(given);
        expect(when).to.equal("11111000000");
    });

    it("Should apply dragon step to 111100001010", () => {
        const given = "111100001010";
        const when = dragonStep(given);
        expect(when).to.equal("1111000010100101011110000");
    });

    it("Should checksum 110010110100", () => {
        const result = checksum("110010110100");
        expect(result).to.equal("100");
    });

    it("Should checksum 10000011110010000111", () => {
        const result = checksum("10000011110010000111");
        expect(result).to.equal("01100");
    });

    it("Should dragon everything 10000", () => {
        const result = dragonEverything("10000", 20);
        expect(result).to.equal("01100");
    });
});