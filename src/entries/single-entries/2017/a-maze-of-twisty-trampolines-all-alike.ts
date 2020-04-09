import { entryForFile } from "../../entry";
export const aMazeOfTwistyTrampolinesAllAlike = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const instructions = lines.map(l => parseInt(l, 10));
        let ip = 0;
        let i = 0;
        while (ip >= 0 && ip < instructions.length) {
            i++;
            const delta = instructions[ip];
            instructions[ip]++;
            ip += delta;
        }
        await outputCallback(i);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const instructions = lines.map(l => parseInt(l, 10));
        let ip = 0;
        let i = 0;
        while (ip >= 0 && ip < instructions.length) {
            i++;
            const delta = instructions[ip];
            if (delta >= 3) {
                instructions[ip]--;
            } else {
                instructions[ip]++;
            }
            ip += delta;
        }
        await outputCallback(i);
    },
    { key: "a-maze-of-twisty-trampolines-all-alike", title: "A Maze of Twisty Trampolines, All Alike", stars: 2, }
);


