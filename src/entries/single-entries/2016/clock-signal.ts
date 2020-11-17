import { entryForFile } from "../../entry";

export const clockSignal = entryForFile(
    async ({ lines, outputCallback }) => {
        const getValue = (ln: number): number => {
            const v = parseInt(lines[ln].split(" ")[1], 10);
            return v;
        };
        const addition = getValue(2) * getValue(1);
        const check = async (a: number): Promise<boolean> => {
            if (a % 2 === 1) {
                return false;
            }
            a += addition;
            let last = 1;
            while (a > 0) {
                const out = a % 2;
                if (out === last) {
                    return false;
                }
                last = out;
                a = Math.floor(a / 2);
            }
            return true;
        };
        let x = 1;
        while (x < addition || x % 2 === 1) {
            if (x % 2 === 0) {
                x *= 2;
                x += 1;
            } else {
                x *= 2;
            }
        }
        await outputCallback("I'm not sure if it works for every input");
        await outputCallback(await check(x - addition));
        await outputCallback(x - addition);

    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "clock-signal", title: "Clock Signal", stars: 2}
);
