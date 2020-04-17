import "mocha";
import { modInverse } from "../algebra";
import { expect } from "chai";

describe("Algebra - Multiplicative inverse", () => {
    it("should calculate mod inverse for 53980726970434", () => {
        const n = 53980726970434n;
        const mod = 119315717514047n;

        const result = modInverse(n, mod);
        expect(result).to.equal(105705171300023n);
    });
    it("should calculate mod inverse for 88598163376194", () => {
        const n = 88598163376194n;
        const mod = 119315717514047n;

        const result = modInverse(n, mod);
        expect(result).to.equal(56927697684517n);
    });

    it("should calculate mod inverse for 65", () => {
        const n = 65n;
        const mod = 119315717514047n;

        const result = modInverse(n, mod);
        expect(result).to.equal(58740045545377n);
    });
});
