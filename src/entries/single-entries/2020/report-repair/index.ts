import { entryForFile } from "../../../entry";
import {
    buildVisualizer,
    seedVisualizer,
    updateDeadCandidateVisualizer,
    updateVisualizerCurrent,
    updateVisualizerFound,
    Visualizer
} from "./visualizer";

const findProd = async (
    ns: number[],
    target: number,
    startFrom: number = 0,
    visualizer?: Visualizer
): Promise<number | null> => {
    let i = startFrom;
    let j = ns.length - 1;
    await seedVisualizer(visualizer, i, j);
    while (ns[i] + ns[j] !== target && i < j) {
        if (ns[i] + ns[j] > target) {
            await updateVisualizerCurrent(visualizer, j, j - 1, "max");
            j--;
        } else {
            await updateVisualizerCurrent(visualizer, i, i + 1, "min");
            i++;
        }
    }
    await updateVisualizerFound(i, j, visualizer);
    return i < j ? ns[i] * ns[j] : null;
};

export const reportRepair = entryForFile(
    async ({ 
        lines,
        outputCallback,
        resultOutputCallback,
        screen,
        pause,
        setAutoStop 
    }) => {
        setAutoStop();
        const ns = lines.map((line) => parseInt(line, 10)).sort((a, b) => a - b);
        console.log(ns);
        const visualizer = await buildVisualizer(screen, ns, 0, pause);
        const result = await findProd(ns, 2020, 0, visualizer);
        await resultOutputCallback(result || "Not found :(");
    },
    async ({ 
        lines, 
        outputCallback, 
        resultOutputCallback,
        screen, 
        pause, 
        setAutoStop
    }) => {
        setAutoStop();
        const ns = lines.map((line) => parseInt(line, 10)).sort((a, b) => a - b);
        const visualizer = await buildVisualizer(screen, ns, 1, pause);
        for (let i = 0; i < ns.length; i++) {
            await updateDeadCandidateVisualizer(visualizer, i);
            const result = await findProd(ns, 2020 - ns[i], i + 1, visualizer);
            if (result) {
                await resultOutputCallback(result * ns[i]);
                return;
            }
        }
        await outputCallback("Not found :(");

    },
    { 
        key: "report-repair", 
        title: "Report Repair", 
        customComponent: "pause-and-run", 
        stars: 2 ,
        supportsQuickRunning: true
    }
);
