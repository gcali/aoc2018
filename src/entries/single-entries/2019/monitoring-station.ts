import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from "../../../support/matrix";
import wu from "wu";
import { Coordinate, diffCoordinate } from "../../../support/geometry";

type Cell = "." | "#";

type Grid = FixedSizeMatrix<Cell>;

function parseInput(lines: string[]): Grid {
    lines = lines.map((l) => l.trim()).filter((l) => !l.startsWith("--"));
    const rawCells = lines.map((l) => l.split("").map((c) => c === "#" ? c : "."));
    const width = rawCells[0].length;
    const height = rawCells.length;
    const matrix = new FixedSizeMatrix<Cell>({ x: width, y: height });
    matrix.setFlatData(rawCells.flatMap((c) => c));
    return matrix;
}

interface Asteroid {
    coordinate: Coordinate;
    canSee?: Asteroid[];
}

interface Visible {
    asteroid: Asteroid;
    isHidden?: boolean;
}

interface Coefficients {
    m: number;
    q: number;
}

function fillVisibilities(asteroids: Asteroid[]) {
    asteroids.forEach((asteroid) => fillVisibility(asteroid, asteroids));
}

function fillVisibility(asteroid: Asteroid, asteroids: Asteroid[]) {
    const asteroidsWithVisibility = asteroids.map<Visible>((e) => ({ asteroid: e, isHidden: false }));
    asteroidsWithVisibility.forEach((otherAsteroid) => {
        if (otherAsteroid.isHidden !== true) {
            const mainVector = diffCoordinate(otherAsteroid.asteroid.coordinate, asteroid.coordinate);
            asteroidsWithVisibility.forEach((candidate) => {
                if (candidate.isHidden !== true) {
                    if (candidate.asteroid === asteroid) {
                        candidate.isHidden = true;
                    } else if (candidate.asteroid !== otherAsteroid.asteroid) {
                        const candidateVector = diffCoordinate(candidate.asteroid.coordinate, asteroid.coordinate);
                        if (mainVector.x === 0) {
                            if (candidateVector.x !== 0) {
                                return;
                            }
                        }
                        if (mainVector.x === 0) {
                            if (candidateVector.x === 0) {
                                if (mainVector.y === 0) {
                                    candidate.isHidden = candidateVector.y === 0;
                                } else {
                                    const coeff = candidateVector.y / mainVector.y;
                                    candidate.isHidden = coeff > 1;
                                }
                            }
                        } else if (mainVector.y === 0) {
                            if (candidateVector.y === 0) {
                                const coeff = candidateVector.x / mainVector.x;
                                candidate.isHidden = coeff > 1;
                            }
                        } else {
                            const xCoeff = candidateVector.x / mainVector.x;
                            const yCoeff = candidateVector.y / mainVector.y;
                            if (xCoeff === yCoeff && xCoeff > 1) {
                                candidate.isHidden = true;
                            }
                        }
                    }
                }
            });
        }
    });
    asteroid.canSee = asteroidsWithVisibility.filter((a) => a.isHidden !== true).map((e) => e.asteroid);
}


export const monitoringStation = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const asteroids = getVisibilities(lines);
        const maxVisibility = asteroids.reduce((acc, next) => Math.max(acc, (next.canSee || []).length), 0);
        await outputCallback(maxVisibility);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        let asteroids = getAsteroids(lines);
        fillVisibilities(asteroids);
        const station = asteroids.reduce((acc, next) => {
            if (next.canSee && next.canSee.length > acc.canSee!.length) {
                return next;
            } else {
                return acc;
            }
        });

        await outputCallback(`Station: (${station.coordinate.x}, ${station.coordinate.y})`);
        const topVisible =
            station.canSee!
                .filter((e) => e.coordinate.x === station.coordinate.x)
                .map((e) => e.coordinate.y)
                .join(" ");
        await outputCallback(`Can see on top: ${topVisible}`);

        let howManyKilled = 0;
        const howManyToKill = 200;
        while (howManyKilled < howManyToKill) {
            const visible = station.canSee!;
            const killList = visible
                .map((e) => ({
                    e,
                    polar: Math.atan2(station.coordinate.y - e.coordinate.y, -e.coordinate.x + station.coordinate.x)
                }))
                .map((e) => ({ ...e, polar: e.polar < Math.PI / 2 ? e.polar + (2 * Math.PI) : e.polar }))
                .map((e) => ({ ...e, polar: -e.polar }))
                .sort((a, b) => b.polar - a.polar);
            if (killList.length === 0) {
                await outputCallback("I'm done without having killed enough :(");
                break;
            }

            for (const toKill of killList) {
                const killedCoordinate = `(${toKill.e.coordinate.x}, ${toKill.e.coordinate.y})`;
                await outputCallback(`${howManyKilled + 1}) Killed: ${killedCoordinate}`);
                asteroids = asteroids
                    .filter((e) =>
                        e.coordinate.x !== toKill.e.coordinate.x ||
                        e.coordinate.y !== toKill.e.coordinate.y
                    );
                howManyKilled++;
                if (howManyKilled === howManyToKill) {
                    break;
                }
            }
            fillVisibilities(asteroids);
        }
    },
    { key: "monitoring-station", title: "Monitoring Station", stars: 2, embeddedData: "monitoring-station/input"}
);

function getVisibilities(lines: string[]) {
    const asteroids = getAsteroids(lines);
    fillVisibilities(asteroids);
    return asteroids;
}

function getAsteroids(lines: string[]) {
    const grid = parseInput(lines);
    let y = 0;
    const asteroids = wu(grid.overRows()).map((row) => {
        const mapped = row
            .map((cell, x) => ({ cell, x, y }))
            .filter((e) => e.cell === "#")
            .map<Asteroid>((e) => ({ coordinate: { x: e.x, y: e.y } }));
        y++;
        return mapped;
    }).reduce((acc, next) => acc.concat(next), []);
    return asteroids;
}

