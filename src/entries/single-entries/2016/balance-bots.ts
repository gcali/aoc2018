import { entryForFile } from "../../entry";

type Instruction = {
    type: "value",
    value: number,
    bot: number
} | {
    type: "give",
    low: number,
    high: number,
    but: number
};

export const balanceBots = entryForFile(
    async ({ lines, outputCallback }) => {
        
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "balance-bots", title: "Balance Bots"}
);