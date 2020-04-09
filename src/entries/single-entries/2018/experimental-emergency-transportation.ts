import { entryForFile } from "../../entry";
import { Coordinate, Coordinate3d, euclidean3dDistance, manhattanDistance } from "../../../support/geometry";
import { hexManhattanDistance } from "../../../support/hex-geometry";

interface NanobotInfo {
    coordinate: Coordinate3d;
    radius: number;
}

const parseLines = (lines: string[]): NanobotInfo[] => {
    return lines.map((line) => {
        const [posToken, rToken] = line.split(", ");
        const [x, y, z] = posToken.split("=")[1].slice(1, -1).split(",").map((e) => parseInt(e, 10));
        const radius = parseInt(rToken.split("=")[1], 10);
        return {
            coordinate: {x, y, z},
            radius
        };
    });
};

export const experimentalEmergencyTransportation = entryForFile(
    async ({ lines, outputCallback }) => {
        const nanobotInfo = parseLines(lines);
        await outputCallback(nanobotInfo);
        const bestNanobot = nanobotInfo.reduce((acc, next) => {
            if (acc.radius > next.radius) {
                return acc;
            } else {
                return next;
            }
        });

        const nanobotsInRange = nanobotInfo
            .map((nanobot) => ({
                bot: nanobot.coordinate,
                r: nanobot.radius,
                distance: manhattanDistance(nanobot.coordinate, bestNanobot.coordinate)
            }))
            .filter((e) => e.distance <= bestNanobot.radius)
            ;
        await outputCallback(nanobotsInRange.length);
    },
    async ({ lines, outputCallback }) => {
        const nanobotInfo = parseLines(lines);
        const distanceRanges = nanobotInfo.map(e => ({
            distance: manhattanDistance({x: 0, y: 0, z: 0}, e.coordinate),
            radius: e.radius
        })).map(e => ({
            start: Math.max(0, e.distance - e.radius),
            end: e.distance + e.radius
        }));
        const segments = distanceRanges.flatMap(e => [
            {pos: e.start, value: 1},
            {pos: e.end, value: -1}
        ]).sort((a, b) => a.pos - b.pos);
        let maxCount = 0;
        let currentCount = 0;
        let bestPos = null;
        let bestEnd = null;
        let updateBestEnd = false;
        segments.forEach(e => {
            currentCount += e.value;
            if (currentCount > maxCount) {
                updateBestEnd = true;
                maxCount = currentCount;
                bestPos = e.pos;
            } else if (updateBestEnd) {
                bestEnd = e.pos;
                updateBestEnd = false;
            }
        });
        await outputCallback({bestPos, bestEnd});
    },
    { key: "experimental-emergency-transportation", title: "Experimental Emergency Transportation", stars: 2, }
);
