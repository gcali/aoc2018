import { entryForFile } from "../../../entry";
import { buildVisualizer } from "./visualizer";

export const binaryBoarding = entryForFile(
    async ({ lines, resultOutputCallback, pause, screen }) => {
        const visualizer = buildVisualizer(screen, pause);
        const boards = lines
            .map((l) => l.split("").map((e) => (e === "B" || e === "R") ? "1" : "0").join(""))
            .map((l) => parseInt(l, 2));
        await visualizer.setup(boards);
        const max = boards
            .reduce((acc, next) => Math.max(acc, next));
        await resultOutputCallback(max);
    },
    async ({ lines, resultOutputCallback, pause, screen }) => {
        const visualizer = buildVisualizer(screen, pause);
        const boards = lines
            .map((l) => l.split("").map((e) => (e === "B" || e === "R") ? "1" : "0").join(""))
            .map((l) => parseInt(l, 2))
            .sort((a, b) => a - b);
        await visualizer.setup(boards);
        for (let i = 0; i < boards.length - 2; i++) {
                if (boards[i] === boards[i + 1] - 2) {
                    await visualizer.setSeatOwned(boards[i] + 1);
                    await resultOutputCallback(boards[i] + 1);
                    return;
                }
            }
        await resultOutputCallback("Didn't find it :(");
    },
    {
        key: "binary-boarding",
        title: "Binary Boarding",
        stars: 2,
        supportsQuickRunning: true,
        embeddedData: true
    }
);
