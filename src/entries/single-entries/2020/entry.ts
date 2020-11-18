import { entryForFile } from "../../entry";

export const placeholder = entryForFile(
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "key", title: "title"}
);
