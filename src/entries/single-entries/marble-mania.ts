import { entryForFile } from "../entry";
import { DoubleLinkedNode } from "../../support/data-structure";
import { SimpleBest, maxNumber } from "../../support/best";

class Game {
    private marbleNodes?: DoubleLinkedNode<number> = null;
    private nextMarble: number = 0;
    private scores: number[];
    private lastPlayer: number = 0;

    constructor(private numberOfPlayers: number, private lastMarble: number) {
        this.scores = new Array<number>(numberOfPlayers);
        for (let i = 0; i < numberOfPlayers; i++) {
            this.scores[i] = 0;
        }
    }

    public addMarble(playerID: number = null): boolean {
        if (playerID === null) {
            playerID = this.lastPlayer;
        }
        let marble = this.nextMarble++;
        if (marble === 0 || marble % 23 !== 0) {
            if (marble === 0) {
                this.marbleNodes = new DoubleLinkedNode<number>(marble);
            }
            else {
                this.marbleNodes = this.marbleNodes.next.append(marble);
            }
        }
        else {
            let currentScore = marble;
            let currentHead = this.marbleNodes;
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
        let max = new SimpleBest<number>(maxNumber)
        this.scores.forEach(s => max.add(s));
        return max.currentBest;
    }

}

const entry = entryForFile(
    lines => {
        let tokens = lines[0].split(" ");
        let players = parseInt(tokens[0]);
        let lastMarble = parseInt(tokens[6]);
        let game = new Game(players, lastMarble);
        while (game.addMarble()) {
            game.switchPlayer();
        }
        console.log(game.highestScores());
    },
    lines => {
        let tokens = lines[0].split(" ");
        let players = parseInt(tokens[0]);
        let lastMarble = parseInt(tokens[6]) * 100;
        let game = new Game(players, lastMarble);
        while (game.addMarble()) {
            game.switchPlayer();
        }
        console.log(game.highestScores());
    }
);
export default entry;