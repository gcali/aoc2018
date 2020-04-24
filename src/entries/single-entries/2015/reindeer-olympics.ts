import { entryForFile } from "../../entry";

interface Reindeer {
    movement: {
        speed: number,
        duration: number
    },
    rest: number,
    name: string
}

const parseReindeers = (lines: string[]): Reindeer[] => {
    return lines.map(line => {
        const tokens = line.split(" ");
        return {
            name: tokens[0],
            rest: parseInt(tokens[tokens.length - 2], 10),
            movement: {
                speed: parseInt(tokens[3], 10),
                duration: parseInt(tokens[6], 10)
            }
        }
    });
};

const calculateDistance = (reindeer: Reindeer, time: number): number => {
    const period = reindeer.rest + reindeer.movement.duration;
    const baseDistance = Math.floor(time / period) * (reindeer.movement.speed * reindeer.movement.duration);
    const restOfTime = time % period;
    const lastMovementTime = Math.min(reindeer.movement.duration, restOfTime);
    const lastDistance = lastMovementTime * reindeer.movement.speed;
    return baseDistance + lastDistance;
};

export const reindeerOlympics = entryForFile(
    async ({ lines, outputCallback }) => {
        const time = 2503;
        const reindeers = parseReindeers(lines);
        const distances = reindeers.map(r => ({
            reindeer: r.name,
            distance: calculateDistance(r, time)
        })).sort((a, b) => a.distance - b.distance);
        await outputCallback(distances);
    },
    async ({ lines, outputCallback }) => {
        const maxTime = 2503;
        const reindeers = parseReindeers(lines);
        let points = new Map<string, number>();
        reindeers.forEach(r => points.set(r.name, 0));
        for (let time = 1; time <= maxTime; time++) {
            const distances = reindeers.map(r => ({
                reindeer: r.name,
                distance: calculateDistance(r, time)
            })).sort((a, b) => b.distance - a.distance);
            const [winner] = distances;
            points.set(winner.reindeer, points.get(winner.reindeer)! + 1);
        }
        await outputCallback([...points.values()].sort((a, b) => a - b));
    },
    { key: "reindeer-olympics", title: "Reindeer Olympics", stars: 2}
);