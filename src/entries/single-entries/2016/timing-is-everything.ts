import { entryForFile } from "../../entry";

interface Disc {
    size: number;
    position: number;
    level: number;
}

interface Ball {
    launchedAt: number;
    level: number;
    debug: string[];
}

const parseLines = (lines: string[]): Disc[] => {
    return lines.map((line) => {
        const tokens = line.replace(/[.,;=#]/g, " ").split(" ").filter((e) => e);
        return {
            level: parseInt(tokens[1], 10),
            size: parseInt(tokens[3], 10),
            position: parseInt(tokens[tokens.length - 1], 10)
        };
    });
};

const moveDisc = (disc: Disc): Disc => {
    return {
        ...disc,
        position: (disc.position + 1) % disc.size
    };
};

class GameState {
    public get time(): number {
        return this._time;
    }
    private _time: number = 0;

    private balls: Ball[] = [];
    constructor(private discs: Disc[]) {
        this.addNewBall();
    }

    public passTime(): Ball | null {
        this._time++;
        this.moveDiscs();
        this.moveBalls();
        const winner = this.findWinner();
        if (winner) {
            return winner;
        }
        this.removeInvalidBalls();
        this.addNewBall();
        this.debug();
        return null;
    }

    public toString(): string {
        return `${this.time}|${this.discs.map((d) => `${d.level}~${d.position}`).join("-")}`;
    }

    private debug() {
        this.balls.forEach((ball) => {
            ball.debug.push(`${this.toString()}!${ball.level}`);
        });
    }

    private addNewBall() {
        this.balls.push({level: 0, launchedAt: this._time, debug: []});
    }

    private moveDiscs() {
        this.discs = this.discs.map(moveDisc);
    }

    private moveBalls() {
        this.balls.forEach((b) => b.level++);
    }

    private findWinner(): Ball | null {
        const winner = this.balls.find((ball) => ball.level > this.discs.length);
        if (winner) {
            return winner;
        }
        return null;
    }

    private removeInvalidBalls() {
        this.balls = this.balls.filter((ball) => {
            const matchingDisc = this.discs[ball.level - 1];
            if (!matchingDisc) {
                throw new Error("What happened here?");
            }
            return matchingDisc.position === 0;
        });
    }
}

export const timingIsEverything = entryForFile(
    async ({ lines, outputCallback }) => {
        const discs = parseLines(lines);
        const state = new GameState(discs);
        while (true) {
            const winner = state.passTime();
            if (winner) {
                await outputCallback("Found winner!");
                await outputCallback(winner.launchedAt);
                await outputCallback(winner.debug.join("\n"));
                break;
            }
            if (state.time % 1000 === 0) {
                await outputCallback("Current time: " + state.time);
            }
        }
    },
    async ({ lines, outputCallback }) => {
        const discs = parseLines(lines);
        discs.push({level: discs.length + 1, position: 0, size: 11});
        const state = new GameState(discs);
        while (true) {
            const winner = state.passTime();
            if (winner) {
                await outputCallback("Found winner!");
                await outputCallback(winner.launchedAt);
                await outputCallback(winner.debug.join("\n"));
                break;
            }
            if (state.time % 1000 === 0) {
                await outputCallback("Current time: " + state.time);
            }
        }
    },
    { key: "timing-is-everything", title: "Timing is Everything", stars: 2}
);
