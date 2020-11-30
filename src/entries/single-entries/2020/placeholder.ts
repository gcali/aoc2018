import { setTimeoutAsync } from "../../../support/async";
import { Drawable, entryForFile } from "../../entry";

export const placeholder = entryForFile(
    async ({ lines, outputCallback, screen }) => {
        await outputCallback("Running");
        if (screen) {
            const printer = await screen.requireScreen();
            const item: Drawable = {id: "unique", color: "white", c: {x: 10, y: 10}, size: {x: 1, y: 1}, type: "rectangle"};
            printer.add(item);
            for (let i = 0; i < 200; i++) {
                item.c.y += 1;
                await setTimeoutAsync(10);
            }
        }
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "key", title: "title"}
);
