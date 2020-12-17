import { UnknownSizeField } from "../../../../support/field";
import { Coordinate3d, Coordinate4d, getFullSurrounding, getSurrounding, manhattanDistance, serialization, sumCoordinate } from "../../../../support/geometry";
import { entryForFile } from "../../../entry";
import { buildCommunicator } from "./communication";

/*During a cycle, all cubes simultaneously change their state according to the following rules:

If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. Otherwise, the cube becomes inactive.
If a cube is inactive but exactly 3 of its neighbors are active, the cube becomes active. Otherwise, the cube remains inactive.
*/

const mapState = (coordinate: Coordinate3d | Coordinate4d, activeCubes: Set<string>): boolean => {
    const surrounding = getFullSurrounding(coordinate);
    const activeSurrounding = surrounding.filter(s => {
        const c = serialization.serialize(s);
        return activeCubes.has(c);
    });
    const isActive = activeCubes.has(serialization.serialize(coordinate));
    if (isActive) {
        if (activeSurrounding.length === 2 || activeSurrounding.length === 3) {
            return true;
        } else {
            return false;
        }
    } else {
        if (activeSurrounding.length === 3) {
            return true;
        } else {
            return false;
        }
    }
};

export const conwayCubes = entryForFile(
    async ({ lines, resultOutputCallback, sendMessage, pause }) => {
        const communicator = buildCommunicator(sendMessage, pause);
        let activeCubes: Set<string> = new Set<string>();
        for (let y = 0; y < lines.length; y++) {
            for (let x = 0; x < lines[y].length; x++) {
                if (lines[y][x] === "#") {
                    activeCubes.add(serialization.serialize({x,y,z:0}));
                }
            }
        }
        const timedCubes: Set<string>[] = [activeCubes];
        for (let i = 0; i < 6; i++) {
            const affected = new Set<string>([...activeCubes].flatMap(e => {
                const coordinate = serialization.deserialize3d(e);
                return getFullSurrounding(coordinate).map(serialization.serialize);;
            }));
            activeCubes = new Set<string>([...affected].filter(e => {
                const coordinate = serialization.deserialize3d(e);
                return mapState(coordinate, activeCubes);
            }));
            timedCubes.push(activeCubes);
        }
        await communicator.send3dData(() => {
            return timedCubes.map((cubes, i) => {
                return {
                    time: i,
                    cubes: [...cubes].map(serialization.deserialize3d)
                };
            });
        })
        await resultOutputCallback(activeCubes.size);
    },
    async ({ lines, resultOutputCallback, sendMessage, pause }) => {
        const communicator = buildCommunicator(sendMessage, pause);
        let activeCubes: Set<string> = new Set<string>();
        for (let y = 0; y < lines.length; y++) {
            for (let x = 0; x < lines[y].length; x++) {
                if (lines[y][x] === "#") {
                    activeCubes.add(serialization.serialize({x,y,z:0,w:0}));
                }
            }
        }
        const timedCubes: Set<string>[] = [activeCubes];
        for (let i = 0; i < 6; i++) {
            await pause();
            const affected = new Set<string>([...activeCubes].flatMap(e => {
                const coordinate = serialization.deserialize4d(e);
                const surrounding = getFullSurrounding(coordinate);
                if (surrounding.length !== 80) {
                    throw new Error("Invalid surrounding");
                }
                return surrounding.map(serialization.serialize);;
            }));
            activeCubes = new Set<string>([...affected].filter(e => {
                const coordinate = serialization.deserialize4d(e);
                return mapState(coordinate, activeCubes);
            }));
            timedCubes.push(activeCubes);
        }

        await communicator.send4dData(() => {
            return timedCubes.map((cubes, i) => {
                return {
                    time: i,
                    cubes: [...cubes].map(serialization.deserialize4d)
                };
            });
        })
        await resultOutputCallback(activeCubes.size);
    },
    { 
        key: "conway-cubes", 
        title: "Conway Cubes",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);