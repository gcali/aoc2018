import { NotImplementedError } from "../../../../support/error";
import { UnknownSizeField } from "../../../../support/field";
import { Coordinate, Coordinate3d, Coordinate4d } from "../../../../support/geometry";
import { MessageSender, Pause } from "../../../entry";

export interface IConwayCubesMessageSender {
    send3dData(activeCubes: () => TimedCubes<Coordinate3d>[]): Promise<void>;
    send4dData(activeCubes: () => TimedCubes<Coordinate4d>[]): Promise<void>;
}
export const buildCommunicator = (
        messageSender: MessageSender | undefined,
        pause: Pause
    ): IConwayCubesMessageSender => {
    if (!messageSender) {
        return new DummyMessageSender();
    } else {
        return new RealMessageSender(messageSender, pause);
    }
};

interface TimedCubes<T> {
    time: number;
    cubes: T[]
};
type PrivateConwayCubesMessage = {
    type: "3d",
    data(time: number, depth: number): string[][]
    minDepth: number;
    maxDepth: number;
    maxTime: number;
    minHyper?: number;
    maxHyper?: number;
} | {
    minDepth: number;
    maxDepth: number;
    maxTime: number;
    minHyper: number;
    maxHyper: number;
    type: "4d",
    data(time: number, depth: number, hyper: number): string[][];
};

export type ConwayCubesMessage = {kind: "ConwayCubesMessage"} & PrivateConwayCubesMessage;

const buildMessage = (message: PrivateConwayCubesMessage): ConwayCubesMessage => {
    return {
        ...message,
        kind: "ConwayCubesMessage"
    };
};

export function isConwayCubesMessage(message: any): message is ConwayCubesMessage {
    return (message as ConwayCubesMessage).kind === "ConwayCubesMessage";
}

class RealMessageSender implements IConwayCubesMessageSender {
    constructor(private readonly messageSender: MessageSender, private readonly pause: Pause) { }
    async send3dData(activeCubes: () => TimedCubes<Coordinate3d>[]): Promise<void> {
        let max = Number.MIN_VALUE;
        let min = Number.MAX_VALUE;
        const timedCubes = activeCubes();
        const allCubes = timedCubes.reduce((acc, next) => acc.concat(next.cubes), [] as Coordinate3d[]);
        for (const cube of allCubes) {
            max = Math.max(cube.z, max);
            min = Math.min(cube.z, min);
        }
        const mainData = [...Array(max+1-min).keys()].map(k => k + min).flatMap(depth => {
            const result: {time: number; depth: number; data: string[][]}[] = [];
            for (let i = 0; i < timedCubes.length; i++) {
                const field = new UnknownSizeField<string>();
                for (const cube of timedCubes[i].cubes) {
                    if (cube.z === depth) {
                        field.set({x: cube.x, y: cube.y}, "#");
                    }
                }
                const data = field.toMatrix().toString(e => e || " ").split("\n").map(e => e.split(""));
                result.push({time: i, depth, data});
            }
            return result;
        })
        this.messageSender(buildMessage({
                type: "3d",
                maxDepth: max,
                minDepth: min,
                data(time, depth) {
                    return mainData.filter(e => e.time === time && e.depth === depth)[0].data;
                },
                maxTime: timedCubes.length-1,
        }));
    }
    async send4dData(activeCubes: () => TimedCubes<Coordinate4d>[]): Promise<void> {
        let max = Number.MIN_VALUE;
        let min = Number.MAX_VALUE;
        let maxHyper = Number.MIN_VALUE;
        let minHyper = Number.MAX_VALUE;
        const timedCubes = activeCubes();
        const allCubes = timedCubes.reduce((acc, next) => acc.concat(next.cubes), [] as Coordinate4d[]);
        for (const cube of allCubes) {
            max = Math.max(cube.z, max);
            min = Math.min(cube.z, min);
            maxHyper = Math.max(cube.w, max);
            minHyper = Math.min(cube.w, min);
        }
        const mainData = [...Array(max+1-min).keys()].map(k => k + min).flatMap(depth => {
            return [...Array(maxHyper+1-minHyper).keys()].map(k => k + min).flatMap(hyper => {
                const result: {time: number; depth: number; hyper: number; data: string[][]}[] = [];
                for (let i = 0; i < timedCubes.length; i++) {
                    const field = new UnknownSizeField<string>();
                    for (const cube of timedCubes[i].cubes) {
                        if (cube.z === depth && cube.w === hyper) {
                            field.set({x: cube.x, y: cube.y}, "#");
                        }
                    }
                    const data = field.toMatrix().toString(e => e || " ").split("\n").map(e => e.split(""));
                    result.push({time: i, depth, hyper, data});
                }
                return result;
            });
        })
        this.messageSender(buildMessage({
                type: "4d",
                maxDepth: max,
                minDepth: min,
                minHyper,
                maxHyper,
                data(time, depth, hyper) {
                    return mainData.filter(e => e.time === time && e.depth === depth && e.hyper === hyper)[0].data;
                },
                maxTime: timedCubes.length-1,
        }));
    }

}

class DummyMessageSender implements IConwayCubesMessageSender {
    async send3dData(activeCubes: () => TimedCubes<Coordinate3d>[]): Promise<void> { }
    async send4dData(activeCubes: () => TimedCubes<Coordinate4d>[]): Promise<void> { }
}