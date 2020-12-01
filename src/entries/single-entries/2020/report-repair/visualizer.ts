import { Coordinate } from "../../../../support/geometry";
import { Drawable, ScreenBuilder } from "../../../entry";

export type VisualizationStatus = "discarded" | "current" | "normal" | "found" | "dead" | "candidate";
export interface VisualizeInstruction {status: VisualizationStatus; index: number; maxOrMin?: "max" | "min"; }
export type Visualizer = (...data: VisualizeInstruction[]) => Promise<void>;


export async function updateVisualizerFound(i: number, j: number, visualizer: Visualizer | undefined) {
    if (i < j && visualizer) {
        await visualizer({ status: "found", index: i }, { status: "found", index: j });
    }
}

export async function updateVisualizerCurrent(
    visualizer: Visualizer | undefined,
    i: number, visualizerIndex: number,
    maxOrMin: "max" | "min"
) {
    if (visualizer) {
        await visualizer({ status: "discarded", index: i }, { status: "current", index: visualizerIndex, maxOrMin });
    }
}

export async function seedVisualizer(visualizer: Visualizer | undefined, i: number, j: number) {
    if (visualizer) {
        const seedInstructions: VisualizeInstruction[] = [];
        for (let k = i; k <= j; k++) {
            seedInstructions.push({ status: k === i || k === j ? "current" : "normal", index: k, maxOrMin: i === k ? "min" : "max" });
        }
        await visualizer(...seedInstructions);
    }
}

export async function buildVisualizer(
    screen: ScreenBuilder | undefined,
    ns: number[],
    start: number,
    pause: () => Promise<void>
) {
    const cellWidth = 2;
    const screenWidth = ns.length * cellWidth * 2 + 20;
    const maxHeight = 120;
    const indicatorHeight = 20;
    const screenHeight = maxHeight + indicatorHeight + 10;
    const xCalculator = (index: number) => index * cellWidth * 2 + 10;

    return await (screen ? async () => {
        const mapColor = (status: VisualizationStatus): string => {
            switch (status) {
                case "current":
                    return "yellow";
                case "discarded":
                    return "red";
                case "found":
                    return "lime";
                case "normal":
                    return "white";
                case "dead":
                    return "black";
                case "candidate":
                    return "cyan";
            }
        };
        const screenPrinter = await screen.requireScreen({ x: screenWidth, y: screenHeight });
        const drawables: Drawable[] = [];
        const maxValue = ns[ns.length - 1];
        for (let i = 0; i < ns.length; i++) {
            const value = ns[i];
            const height = (value / maxValue) * maxHeight;
            drawables.push({
                c: { x: xCalculator(i), y: indicatorHeight + (maxHeight - height) + 10 },
                color: mapColor("normal"),
                id: i.toString(),
                type: "rectangle",
                size: { x: cellWidth, y: height }
            });
        }
        const minCurrent: Drawable = {
            c: { x: xCalculator(start), y: 0 },
            color: mapColor("current"),
            id: "minCurrent",
            type: "rectangle",
            size: { x: cellWidth, y: indicatorHeight }
        };
        const maxCurrent: Drawable = {
            c: { x: xCalculator(ns.length - 1), y: 0 },
            color: mapColor("current"),
            id: "maxCurrent",
            type: "rectangle",
            size: { x: cellWidth, y: indicatorHeight }
        };
        const candidateCoordinates: Coordinate = {x: -4, y: 0};
        const candidate: Drawable = {
            c: candidateCoordinates,
            color: mapColor("candidate"),
            id: "candidate",
            type: "rectangle",
            size: { x: cellWidth, y: indicatorHeight }
        };
        drawables.push(minCurrent);
        drawables.push(maxCurrent);
        await screenPrinter.replace(drawables);
        return async (...data: VisualizeInstruction[]) => {
            for (const instruction of data) {
                if (instruction.index >= 0 && instruction.index < drawables.length) {
                    drawables[instruction.index].color = mapColor(instruction.status);
                    const newX = xCalculator(instruction.index);
                    if (instruction.status === "current") {
                        if (instruction.maxOrMin === "max") {
                            maxCurrent.c.x = newX;
                        } else {
                            minCurrent.c.x = newX;
                        }
                    } else if (instruction.status === "candidate") {
                        if (candidateCoordinates.x < 0) {
                            screenPrinter.add(candidate);
                        }
                        candidateCoordinates.x = newX;
                    }
                }
            }
            await pause();
        };
    } : async () => undefined)();
}

export async function updateDeadCandidateVisualizer(visualizer: Visualizer | undefined, i: number) {
    if (visualizer) {
        const toVisualize: VisualizeInstruction[] = [{ status: "candidate", index: i }];
        if (i > 0) {
            toVisualize.push({ status: "dead", index: i - 1 });
        }
        await visualizer(...toVisualize);
    }
}
