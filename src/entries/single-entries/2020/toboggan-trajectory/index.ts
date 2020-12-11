import { CCoordinate, Coordinate } from "../../../../support/geometry";
import { entryForFile } from "../../../entry";
import { buildVisualizer } from "./visualizer";

const parseLines = (lines: string[]): {grid: string[][], size: Coordinate} => {
    const height = lines.length;
    const width = lines[0].length;
    return {grid: lines.map((line) => line.split("")), size: {x: width, y: height}};
};

export const tobogganTrajectory = entryForFile(
    async ({ lines, resultOutputCallback, pause, screen, setAutoStop }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const {grid, size} = parseLines(lines);
        await visualizer.setupField(grid, size);
        const slope = new CCoordinate(3, 1);
        let currentCoordinate = {x: 0, y: 0};
        let trees = 0;
        while (currentCoordinate.y < size.y) {
            const collides = grid[currentCoordinate.y][currentCoordinate.x] === "#";
            if (collides) {
                trees++;
            }
            await visualizer.moveToboggan(currentCoordinate, collides);
            currentCoordinate = slope.sum(currentCoordinate);
            currentCoordinate.x %= size.x;
        }
        await resultOutputCallback(trees);
    },
    async ({ lines, resultOutputCallback, pause, screen, setAutoStop}) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const {grid, size} = parseLines(lines);
        await visualizer.setupField(grid, size);
        const candidateSlopes = [
            {x: 1, y: 1},
            {x: 3, y: 1},
            {x: 5, y: 1},
            {x: 7, y: 1},
            {x: 1, y: 2}
        ].map((s) => new CCoordinate(s.x, s.y));
        let result = 1;
        for (const slope of candidateSlopes) {
            await visualizer.resetField();
            let currentCoordinate = {x: 0, y: 0};
            let trees = 0;
            while (currentCoordinate.y < size.y) {
                const collides = grid[currentCoordinate.y][currentCoordinate.x] === "#";
                if (collides) {
                    trees++;
                }
                await visualizer.moveToboggan(currentCoordinate, collides);
                currentCoordinate = slope.sum(currentCoordinate);
                currentCoordinate.x %= size.x;
            }
            result *= trees;
        }
        await resultOutputCallback(result);
    },
    {
        key: "toboggan-trajectory",
        title: "Toboggan Trajectory",
        stars: 2,
        customComponent: "pause-and-run",
        suggestedDelay: 50,
        supportsQuickRunning: true,
        embeddedData: true
    }
);

/*
    8:38
    Ok, let's start
    8:39
    Nice! I like this one, it seems I can do some interesting visualizations later on.
    I'll probably use my field for the second part, but let's do it more simply for the first
    8:46
    Ok, first part done, let's see the second one
    8:50
    Way easier than expected, no field necessary.
    I remembered the third days to be more difficult! So, 12 minutes, would I have been able to
    get in the leaderboard? ... Of course not,
    00:04:56 is the slowest time. Ok, that's it for now, I'll try some visualizations
    later
*/
