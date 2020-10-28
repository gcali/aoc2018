import { entryForFile } from "../../entry";

type Instruction = {
    type: "value";
    value: number;
    bot: number;
} | {
    type: "give";
    low: Out;
    high: Out;
    bot: number;
};

type BotState = {
    id: number;
    chips: number[];
}

type Out = {
        type: "output" | "bot";
        value: number;
}

const parseLines = (lines: string[]): Instruction[] => {
    return lines.map(line => {
        const tokens = line.split(" ");
        if (line.includes("goes")) {
            //line is value
            return {
                type: "value",
                value: parseInt(tokens[1], 10),
                bot: parseInt(tokens[5], 10)
            };
        } else {
            //line is give
            return {
                type: "give",
                bot: parseInt(tokens[1], 10),
                high: {
                    value: parseInt(tokens[11], 10),
                    type: tokens[10] as "bot" | "output"
                },
                low: {
                    value: parseInt(tokens[6], 10),
                    type: tokens[5] as "bot" | "output"
                }
            };
        }
    });
}

class Machine {
    private callback?: (instruction: Instruction, botState: BotState) => void;
    private toExecute: Instruction[] = [];
    private botState: Map<number, BotState> = new Map<number, BotState>();
    private outputState: Map<number,number[]> = new Map<number, number[]>();

    private stop: boolean = false;

    public execute(instruction: Instruction): void {
        if (this.canExecute(instruction)) {
            this.doExecute(instruction);
            this.executePending();
        } else {
            this.toExecute.push(instruction);
        }
    }  

    public getOutput(id: number): number[] {
        return this.outputState.get(id) || [];
    }

    private canExecute(instruction: Instruction): boolean {
        if (instruction.type === "value") {
            return true;
        } else {
            const bot = this.botState.get(instruction.bot);
            if (!bot) {
                return false;
            }
            return bot.chips.length === 2;
        }
    }

    private doExecute(instruction: Instruction): void {
        const bot = this.getState(instruction.bot);
        if (this.callback) {
            this.callback(instruction, bot);
        }
        if (instruction.type === "value") {
            bot.chips.push(instruction.value);
        } else {
            const high = Math.max(...bot.chips);
            const low = Math.min(...bot.chips);
            bot.chips = [];
            this.giveTo(instruction.high, high);
            this.giveTo(instruction.low, low);
        }
    }

    private giveTo({type, value}: Out, chip: number): void {
        if (type === "bot" ) {
            const state = this.getState(value);
            state.chips.push(chip);
        } else {
            this.output(value,chip);
        }
    }

    private output(id: number, chip: number): void {
        const bin = this.outputState.get(id) || [];
        bin.push(chip);
        this.outputState.set(id, bin);
    }

    private getState(bot: number): BotState {
        return this.botState.get(bot) || this.createBot(bot);
    }

    private createBot(bot: number): BotState {
        const state: BotState = {
            id: bot,
            chips: []
        };
        this.botState.set(bot, state);
        return state;
    }

    private executePending(): void {
        if (this.stop) {
            this.stop = false;
            return;
        }
        for (let i = 0; i < this.toExecute.length; i++) {
            const instruction = this.toExecute[i];
            if (this.canExecute(instruction)) {
                this.doExecute(instruction);
                this.toExecute.splice(i, 1);
                return this.executePending();
            }
        }
    }

    public stopNextPending(): void {
        this.stop = true;
    }

    public executeBeforeEveryInstruction(callback: (instruction: Instruction, botState: BotState) => void): void {
        this.callback = callback;
    }
}

export const balanceBots = entryForFile(
    async ({ lines, outputCallback }) => {
        const instructions = parseLines(lines);
        const machine = new Machine();
        let target: number | null = null;
        machine.executeBeforeEveryInstruction((instruction, botState) => {
            if (botState.chips.length === 2) {
                const [low,high] = [Math.min(...botState.chips),Math.max(...botState.chips)];
                if (low === 17 && high === 61) {
                    target = botState.id;
                }
            }
        });
        for (const instruction of instructions) {
            machine.execute(instruction);
            if (target !== null) {
                await outputCallback("Bot was: " + target);
                return;
            }
        }
        await outputCallback("Not found :(");
    },
    async ({ lines, outputCallback }) => {
        const instructions = parseLines(lines);
        const machine = new Machine();
        for (const instruction of instructions) {
            machine.execute(instruction);
        }
        let result = 1;
        for (let i = 0; i < 3; i++) {
            const [x] = machine.getOutput(i);
            result *= x;
        }
        await outputCallback(result);
    },
    { key: "balance-bots", title: "Balance Bots", stars: 2}
);