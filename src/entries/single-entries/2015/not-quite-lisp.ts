import { entryForFile } from "../../entry";

export const notQuiteLisp = entryForFile(
    async ({ lines, outputCallback }) => {
        const line = lines[0];
        const count = line.split("").reduce((acc, next) => acc + (next === "(" ? 1 : -1), 0);
        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        const line = lines[0];

        let position = 0;
        for (let i = 0; i < line.length; i++) {
            position += (line[i] === "(" ? 1 : -1);
            if (position < 0) {
                await outputCallback("Found it! " + (i + 1));
                return;
            }
        }

        await outputCallback("Never gone to the basement");
    },
    { key: "not-quite-lisp", title: "Not Quite Lisp", stars: 2 }
);
