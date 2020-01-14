import "mocha";

import { expect } from "chai";
import { Field, getCandidates, coordinateToKey, commands as commandRegistry } from "../oxygen-system";

function getField(labyrinth: string[]): Field {
    return Field.fromSerialization(labyrinth.join("\n"));
}

describe("Oxygen System", async () => {
    it("should deserialize correctly", async () => {
        const expectedLabyrinth = [
            "#####",
            "#...#",
            "###.#",
            "#.#.#",
            "#...#",
            "#####"
        ].join("\n");

        const parsed = Field.fromSerialization(expectedLabyrinth);
        const reserialized = parsed.toString();
        expect(reserialized).to.equal(expectedLabyrinth);
    });

    it("should skip empty cells on deserialization", () => {
        const labyrinth = "#X#";
        const parsed = Field.fromSerialization(labyrinth);
        const valorized = [0, 1, 2].map((col) => parsed.getCell({ x: col, y: 0 }));
        expect(valorized).to.have.length(3);
        expect(valorized.filter((e) => e)).to.have.length(2);
        expect(valorized[0]!.coordinate.x).to.equal(0);
        const _ = expect(valorized[1]).to.be.undefined;
        expect(valorized[2]!.coordinate.x).to.equal(2);
    });

    it("should serialize empty cells", () => {
        const baseLabyrinth = "#X#";
        const expectedLabyrinth = "# #";
        const parsed = Field.fromSerialization(baseLabyrinth);
        const reserialized = parsed.toString();
        expect(reserialized).to.equal(expectedLabyrinth);
    });

    it("should get two distances", () => {
        const labyrinth = getField([
            "###",
            "#. ",
            "#.#",
            "###"
        ]);

        const distances = labyrinth.getDistances({ x: 1, y: 2 });
        expect(Object.values(distances)).to.have.length(2);
    });

    it("should match the two distances", () => {
        const labyrinth = getField([
            "###",
            "#. ",
            "#.#",
            "###"
        ]);

        const distances = labyrinth.getDistances({ x: 1, y: 2 });
        const starting = distances[coordinateToKey({ x: 1, y: 2 })];
        const other = distances[coordinateToKey({ x: 1, y: 1 })];
        expect(starting.distance).to.equal(0);
        expect(other.distance).to.equal(1);
    });

    it("should find one candidate", () => {
        const labyrinth = [
            "###",
            "#. ",
            "#.#",
            "###"
        ].join("\n");
        const parsed = Field.fromSerialization(labyrinth);
        const distances = parsed.getDistances({ x: 1, y: 2 });
        const candidates = getCandidates(distances, parsed.getCell.bind(parsed));
        expect(candidates).to.have.length(1);
        expect(candidates[0].coordinate.x).to.equal(1);
        expect(candidates[0].coordinate.y).to.equal(1);
    });

    it("should find one candidate, inverted sorting", () => {
        const labyrinth = [
            "###",
            "#.#",
            "#. ",
            "###"
        ].join("\n");
        const parsed = Field.fromSerialization(labyrinth);
        const distances = parsed.getDistances({ x: 1, y: 1 });
        const candidates = getCandidates(distances, parsed.getCell.bind(parsed));
        expect(candidates).to.have.length(1);
        expect(candidates[0].coordinate.x).to.equal(1);
        expect(candidates[0].coordinate.y).to.equal(2);
    });

    it("should go right", () => {
        const labyrinth = getField([
            "###",
            "#. ",
            "#.#",
            "###"
        ]);
        const commands = labyrinth.findCommandsToNearestUnkown({ x: 1, y: 1 });
        expect(commands).to.have.length(1);
        const firstCommand = commands[0][0];
        expect(firstCommand).to.equal(commandRegistry.right);
    });

    it("should go up and right", () => {
        const labyrinth = getField([
            "###",
            "#. ",
            "#.#",
            "###"
        ]);
        const commands = labyrinth.findCommandsToNearestUnkown({ x: 1, y: 2 });
        expect(commands).to.have.length(2);
        const firstCommand = commands[0][0];
        expect(firstCommand).to.equal(commandRegistry.up);
        const second = commands[1][0];
        expect(second).to.equal(commandRegistry.right);
    });

    it("should go choose shortest path", () => {
        const labyrinth = getField([
            "###",
            "#. ",
            "#.#",
            "#.#",
            "#.#",
            "#.#",
            "# #"
        ]);
        const commands = labyrinth.findCommandsToNearestUnkown({ x: 1, y: 2 });
        expect(commands).to.have.length(2);
        const firstCommand = commands[0][0];
        expect(firstCommand).to.equal(commandRegistry.up);
        const second = commands[1][0];
        expect(second).to.equal(commandRegistry.right);
    });

    it("should go choose shortest path, map reversed", () => {
        const labyrinth = getField([
            "###",
            "#. ",
            "#.#",
            "#.#",
            "#.#",
            "#.#",
            "# #"
        ].reverse());
        const commands = labyrinth.findCommandsToNearestUnkown({ x: 1, y: 4 });
        expect(commands).to.have.length(2);
        const firstCommand = commands[0][0];
        expect(firstCommand).to.equal(commandRegistry.down);
        const second = commands[1][0];
        expect(second).to.equal(commandRegistry.right);
    });

});
