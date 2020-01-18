import "mocha";

import { expect } from "chai";

import { parseLines, serializeRegex } from "../a-regular-map";

describe("Regex", async () => {
    it("should serialize the original regex", () => {
        const originalRegex = "^ESSWWN(E|NNENN(EESS(WNSE|)SSS|WWWSSSSE(SW|NNNE)))$";
        const regex = parseLines([originalRegex]);
        const serialized = serializeRegex(regex);
        expect(`^${regex}$`).to.equal(originalRegex);
    });
});
