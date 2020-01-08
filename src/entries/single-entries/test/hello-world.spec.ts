import 'mocha';

import { expect } from 'chai';

const hello = () => "Hello world";

describe("hello", () => {
    it('returns a string', () => {
        const res = hello();
        expect(res).to.be.a('string');
    });

    it('returns hello world', () => {
        const expected = "Hello world";
        expect(hello()).to.be.equal(expected);
    });
});