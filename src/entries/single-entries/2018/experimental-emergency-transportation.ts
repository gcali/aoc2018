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
        const getBounds = (s: number[]) => {
            let max = Number.NEGATIVE_INFINITY;
            let min = Number.POSITIVE_INFINITY;
            s.forEach((n) => {
                max = Math.max(max, n);
                min = Math.min(min, n);
            });
            return {max, min};
        };
        const boundsX = getBounds(nanobotInfo.map((e) => e.coordinate.x));
        const boundsY = getBounds(nanobotInfo.map((e) => e.coordinate.y));
        const boundsZ = getBounds(nanobotInfo.map((e) => e.coordinate.z));
        await outputCallback((boundsX.max - boundsX.min) * (boundsY.max - boundsY.min) * (boundsZ.max - boundsZ.min));
    }
);
