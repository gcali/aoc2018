import { oldEntryForFile } from "../entry";
import { CircularDoubleLinkedNode } from "../../support/data-structure";
import { SimpleBest, maxNumber } from "../../support/best";
// import { log } from "@/support/log";

class Game {
    private marbleNodes: CircularDoubleLinkedNode<number> | null = null;
    private nextMarble: number = 0;
    private scores: number[];
    private lastPlayer: number = 0;

    constructor(private numberOfPlayers: number, private lastMarble: number) {
        this.scores = new Array<number>(numberOfPlayers);
        for (let i = 0; i < numberOfPlayers; i++) {
            this.scores[i] = 0;
        }
    }

    public addMarble(playerID: number | null = null): boolean {
        if (playerID === null) {
            playerID = this.lastPlayer;
        }
        const marble = this.nextMarble++;
        if (marble === 0 || marble % 23 !== 0) {
            if (marble === 0) {
                this.marbleNodes = new CircularDoubleLinkedNode<number>(marble);
            } else {
                this.marbleNodes = this.marbleNodes!.next.append(marble);
            }
        } else {
            let currentScore = marble;
            let currentHead = this.marbleNodes!;
            for (let i = 0; i < 6; i++) {
                currentHead = currentHead.prev;
            }
            currentScore += currentHead.removePrevious();
            this.marbleNodes = currentHead;
            this.scores[playerID] += currentScore;
        }
        this.lastPlayer = playerID;
        return marble !== this.lastMarble;
    }

    public switchPlayer() {
        this.lastPlayer = (this.lastPlayer + 1) % this.numberOfPlayers;
    }

    public highestScores(): number {
        const max = new SimpleBest<number>(maxNumber);
        this.scores.forEach((s) => max.add(s));
        return max.currentBest!;
    }

}

export const entry = oldEntryForFile(
    async (lines, outputCallback) => {
        const tokens = lines[0].split(" ");
        const players = parseInt(tokens[0], 10);
        const lastMarble = parseInt(tokens[6], 10);
        const game = new Game(players, lastMarble);
        while (game.addMarble()) {
            game.switchPlayer();
        }
        outputCallback(game.highestScores());
    },
    async (lines, outputCallback) => {
        const tokens = lines[0].split(" ");
        const players = parseInt(tokens[0], 10);
        const lastMarble = parseInt(tokens[6], 10) * 100;
        const game = new Game(players, lastMarble);
        while (game.addMarble()) {
            game.switchPlayer();
        }
        outputCallback(game.highestScores());
    },
);
