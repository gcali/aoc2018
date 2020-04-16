import "mocha";
import { executeInput, Deck, findNumberAtPosition } from '../slam-shuffle';
import { expectSameArrays } from '../../../../support/assertions';
import { expect } from 'chai';

const baseInput: string[] = [
    "deal into new stack",
    "cut -2",
    "deal with increment 7",
    "cut 8",
    "cut -4",
    "deal with increment 7",
    "cut 3",
    "deal with increment 9",
    "deal with increment 3",
    "cut -1"
];

describe("Slam Shuffle", () => {
    it("should shuffle dek correctly", () => {
        const deck = new Deck(10);
        executeInput(baseInput, deck);
        const res = deck.sort().map(e => e.card);
        expectSameArrays([9,2,5,8,1,4,7,0,3,6], res);
    });

    // it("should revert single shuffle", async () => {
    //     const deck = new Deck(10);
    //     executeInput(baseInput, deck);
    //     const shuffled = deck.sort().map(e => e.card);
    //     for (let i = 0; i < shuffled.length; i++) {
    //         const value = await findNumberAtPosition(baseInput, 10, i, 1);
    //         expect(value).to.equal(shuffled[i], `Iteration ${i}, `);
    //     }
    // });

    // it("should revert double shuffle", async () => {
    //     const deck = new Deck(10);
    //     executeInput(baseInput, deck);
    //     executeInput(baseInput, deck);
    //     const shuffled = deck.sort().map(e => e.card);
    //     for (let i = 0; i < shuffled.length; i++) {
    //         const value = await findNumberAtPosition(baseInput, 10, i, 2);
    //         expect(value).to.equal(shuffled[i], "Iteration: " + i);
    //     }
    // });

    it("should revert 100 shuffles", async () => {
        const deck = new Deck(10);
        for (let i = 0 ; i < 100; i++) {
            executeInput(baseInput, deck);
        }
        const shuffled = deck.sort().map(e => e.card);
        for (let i = 0; i < shuffled.length; i++) {
            const value = await findNumberAtPosition(baseInput, 10, i, 100);
            expect(value).to.equal(shuffled[i], "Iteration " + i);
        }
    });

    it("should revert 10000 shuffles", async () => {
        const deck = new Deck(10);
        for (let i = 0 ; i < 10000; i++) {
            executeInput(baseInput, deck);
        }
        const shuffled = deck.sort().map(e => e.card);
        for (let i = 0; i < shuffled.length; i++) {
            const value = await findNumberAtPosition(baseInput, 10, i, 10000);
            expect(value).to.equal(shuffled[i], "Iteration " + i);
        }
    });
});