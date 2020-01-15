import "mocha";

import { expect } from "chai";
import { parseLines, Key, getCandidateSteps, isKey } from "../many-worlds-interpretation";
import { manhattanDistance } from "../../../../support/geometry";
import { List } from "linq-typescript";

const simpleLabyrinth = [
    // 2345678901234567
    "########################",
    "#f.D.E.e.C.b.A.@.a.B.c.#",
    "######################.#",
    "#d.....................#",
    "########################",
].join("\n");

const multipleDestinationsLabyrinth = [
    // 2345678901234567
    "###############",
    "#..A.b.@..a.B.#",
    "###############",
].join("\n");

function getSimpleLabyrinth() {
    return parseLines(simpleLabyrinth.split("\n"));
}

describe("Many Worlds Interpretation", () => {
    it("should parse the base test labyrinth", () => {
        const labyrinth = parseLines(simpleLabyrinth.split("\n"));
        expect(labyrinth.toString()).to.equal(simpleLabyrinth);
    });

    it("should have found the start cell", () => {
        const labyrinth = getSimpleLabyrinth();
        expect(manhattanDistance(labyrinth.startCoordinate, { x: 15, y: 1 })).to.equal(0);
    });

    it("should have found 0 distance for the starting cell", () => {
        const labyrinth = getSimpleLabyrinth();
        const distances = labyrinth.getDistances();
        const startingCell = { x: 15, y: 1 };
        const startingCellDistance = distances
            .filter((e) => manhattanDistance(e.coordinate, startingCell) === 0)[0].distance;
        expect(startingCellDistance).to.equal(0);
    });

    it("should get the 4 possible movements", () => {
        const labyrinth = getSimpleLabyrinth();
        expect(labyrinth.getDistances()).to.have.length(5);
    });

    it("should get the one possible destination", () => {
        const labyrinth = getSimpleLabyrinth();
        expect(labyrinth.getDestinations()).to.have.length(1);
    });

    it("should get the right possible destination", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        expect((destination.cell as Key).name).to.be.equal("a");
    });

    it("should get the right distance from the destination", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        expect(destination.distance).to.equal(2);
    });

    it("should find the correct number of candidates", () => {
        const labyrinth = getSimpleLabyrinth();
        const distances = labyrinth.getDistances();
        const destination = labyrinth.getDestinations()[0];
        const candidates = getCandidateSteps(
            destination.coordinate,
            (c) => new List(distances.filter((e) => manhattanDistance(e.coordinate, c) === 0)).firstOrDefault() || null,
            destination.distance!
        );
        expect(candidates).to.have.length(1);
    });

    it("should find the correct candidate", () => {
        const labyrinth = getSimpleLabyrinth();
        const distances = labyrinth.getDistances();
        const destination = labyrinth.getDestinations()[0];
        const candidates = getCandidateSteps(
            destination.coordinate,
            (c) => new List(distances.filter((e) => manhattanDistance(e.coordinate, c) === 0)).firstOrDefault() || null,
            destination.distance!
        );
        const candidate = candidates[0];
        expect(manhattanDistance(candidate!.coordinate, { x: 16, y: 1 })).to.equal(0);
    });

    it("should get the two steps for the target", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        const steps = labyrinth.getPathFor(destination.coordinate);
        expect(steps).to.have.length(2);
    });

    it("should get to destination by following steps", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        const steps = labyrinth.getPathFor(destination.coordinate);
        let cell = labyrinth.startCoordinate;
        steps.forEach((s) => cell = s.sum(cell));

        expect(manhattanDistance(cell, destination.coordinate)).to.equal(0);
    });

    it("should keep same original labyrinth after moving", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        const startCoordinate = labyrinth.startCoordinate;
        const newLabyrinth = labyrinth.moveTo(destination.coordinate);
        expect(manhattanDistance(startCoordinate, labyrinth.startCoordinate)).to.equal(0);
    });

    it("should update coordinate after moving", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        const newLabyrinth = labyrinth.moveTo(destination.coordinate);
        expect(manhattanDistance(destination.coordinate, newLabyrinth.startCoordinate)).to.equal(0);
    });

    it("should remove door after moving", () => {
        const labyrinth = getSimpleLabyrinth();
        const destination = labyrinth.getDestinations()[0];
        const newLabyrinth = labyrinth.moveTo(destination.coordinate);
        const newDestinations = newLabyrinth.getDestinations();
        const hasFound = newDestinations.filter((e) => isKey(e.cell) && e.cell.name === "b").length === 1;
        expect(hasFound).to.be.true;
    });

    it("should have two destinations", () => {
        const labyrinth = parseLines(multipleDestinationsLabyrinth.split("\n"));
        const destinations = labyrinth.getDestinations();
        expect(destinations).to.have.length(2);
    });
    it("should have two destinations with two and three steps", () => {
        const labyrinth = parseLines(multipleDestinationsLabyrinth.split("\n"));
        const destinations = labyrinth.getDestinationsWithPaths();
        const pathLenghts = destinations.map((d) => d.path.length).sort();
        expect(pathLenghts[0]).to.equal(2);
        expect(pathLenghts[1]).to.equal(3);
    });

    it("should solve in 7 steps", async () => {
        const labyrinth = parseLines(multipleDestinationsLabyrinth.split("\n"));
        const strategy = await labyrinth.findBestStrategy();
        expect(strategy).to.have.length(7);
    });
    it("should solve in 86 steps", async () => {
        const labyrinth = getSimpleLabyrinth();
        const strategy = await labyrinth.findBestStrategy();
        expect(strategy).to.have.length(86);
    });

});

