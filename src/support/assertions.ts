import { expect } from "chai";

export function expectSameArrays<T>(a: T[], b: T[]) {
    expect(a).to.have.length(b.length);
    for (let i = 0; i < a.length; i++) {
        expect(a[i]).to.equal(b[i]);
    }
}
