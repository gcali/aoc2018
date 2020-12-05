import { entryForFile } from "../../../entry";
import { buildVisualizer } from "./visualizer";

export const binaryBoarding = entryForFile(
    async ({ lines, outputCallback, pause, screen }) => {
        const visualizer = buildVisualizer(screen, pause);
        const boards = lines
            .map((l) => l.split("").map((e) => (e === "B" || e === "R") ? "1" : "0").join(""))
            .map((l) => parseInt(l, 2));
        await visualizer.setup(boards);
        const max = boards
            .reduce((acc, next) => Math.max(acc, next));
        await outputCallback(max);
    },
    async ({ lines, outputCallback, pause, screen }) => {
        const visualizer = buildVisualizer(screen, pause);
        const boards = lines
            .map((l) => l.split("").map((e) => (e === "B" || e === "R") ? "1" : "0").join(""))
            .map((l) => parseInt(l, 2))
            .sort((a, b) => a - b);
        await visualizer.setup(boards);
        for (let i = 0; i < boards.length - 2; i++) {
                if (boards[i] === boards[i + 1] - 2) {
                    await visualizer.setSeatOwned(boards[i] + 1);
                    await outputCallback("Found it:");
                    await outputCallback(boards[i] + 1);
                    return;
                }
            }
        await outputCallback("Didn't find it :(");
    },
    { key: "binary-boarding", title: "Binary Boarding"}
);
