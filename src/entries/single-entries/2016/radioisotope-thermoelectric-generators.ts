import { Queue } from "../../../support/data-structure";
import { subsetGenerator } from "../../../support/sequences";
import { entryForFile } from "../../entry";
import { balanceBots } from "./balance-bots";

interface Item {
    element: string;
    type: "generator" | "chip";
}

function match(a: Item, b: Item): boolean {
    return a.element === b.element && a.type === b.type;
}

type Direction = "up" | "down";

class Building {

    public currentFloor: number = 0;
    private _state: Item[][];

    constructor() {
        const floors = 4;
        this._state = [];
        for (let i = 0; i < floors; i++) {
            this._state.push([]);
        }
    }

    public setFloors(floors: Array<{floorId: number, items: Item[]}>): void {
        for (const floor of floors) {
            if (floor.floorId < 0 || floor.floorId >= this._state.length) {
                throw new Error("Invalid floor ID: " + floor.floorId);
            }
            this._state[floor.floorId] = floor.items;
        }
    }

    public addToFloor(floorId: number, items: Item[]): void {
        if (floorId < 0 || floorId >= this._state.length) {
            throw new Error("Invalid floor id: " + floorId);
        }
        this._state[floorId] = this._state[floorId].concat(items);
    }

    public move(items: Item[], direction: Direction): Building | null {
        const [floor] = this._state.map((e, i) => ({e, i})).filter((e) => {
            for (const item of items) {
                if (e.e.filter((x) => match(x, item)).length === 0) {
                    return false;
                }
            }
            return true;
        });
        if (!floor || floor.i !== this.currentFloor) {
            return null;
        }
        const newFloorIndex = floor.i + (direction === "up" ? 1 : -1);
        const newFloor = this._state[newFloorIndex];
        if (!newFloor) {
            return null;
        }

        const newBuilding = this.clone();
        newBuilding._state[floor.i] = floor.e.filter((e) => items.filter((x) => match(x, e)).length === 0);
        newBuilding._state[newFloorIndex] = newFloor.concat(items);
        newBuilding.currentFloor = newFloorIndex;

        const isValid = newBuilding.isValid();
        if (isValid) {
            return newBuilding;
        }
        return null;
    }

    public isAllOnLastFloor(): boolean {
        for (let i = 0; i < this._state.length - 1; i++) {
            if (this._state[i].length > 0) {
                return false;
            }
        }
        return true;
    }

    public isSubsetValid(items: Item[]) {
        const floor = items;
        const generators = floor.filter((e) => e.type === "generator");
        if (generators.length === 0) {
            return true;
        }
        const chips = floor.filter((e) => e.type === "chip");
        for (const chip of chips) {
            if (generators.filter((e) => e.element === chip.element).length == 0) {
                return false;
            }
        }
        return true;
    }

    public isValid(): boolean {
        for (const floor of this._state) {
            if (!this.isSubsetValid(floor)) {
                return false;
            }
        }
        return true;
    }

    public currentFloorItems(): Item[] {
        return this._state[this.currentFloor];
    }

    public clone(): Building {
        const newBuilding = new Building();
        newBuilding._state = this._state.map((e) => [...e]);
        newBuilding.currentFloor = this.currentFloor;
        return newBuilding;
    }

    public serialize(): string {
        const res: string[] = [`${this.currentFloor}|`];
        for (let i = 0; i < this._state.length; i++) {
            res.push(i.toString());
            const sorted = this._state[i].map((e) => toColumn(e)).sort();
            sorted.forEach((e) => res.push(e));
        }
        return res.join("");
    }

    public serializeToEquivalent(): string {
        const elementMap = new Map<string, number>();

        const res: string[] = [`${this.currentFloor}|`];

        let nextMapped = 0;

        for (let i = 0; i < this._state.length; i++) {
            res.push(i.toString() + "~");
            for (const item of this._state[i])  {
                if (!elementMap.has(item.element)) {
                    elementMap.set(item.element, nextMapped++);
                }
            }

            const line: string[] = [];
            for (const item of this._state[i]) {
                line.push(`${elementMap.get(item.element)}${item.type}`);
            }
            res.push(line.sort().join(","));
        }

        return res.join(".");

    }

    public toString(): string {
        const out: string[] = [];
        const columns: string[] = ["E "];
        for (const floor of this._state) {
            for (const item of floor) {
                columns.push(toColumn(item));
            }
        }
        for (let i = this._state.length - 1; i >= 0; i--) {
            const serializedFloor: string[] = [`F${i}`];
            for (const column of columns) {
                if (column === "E ") {
                    if (i === this.currentFloor) {
                        serializedFloor.push("E ");
                    } else {
                        serializedFloor.push(". ");
                    }
                } else {
                    if (this._state[i].filter((e) => toColumn(e) === column).length > 0) {
                        serializedFloor.push(column);
                    } else {
                        serializedFloor.push(". ");
                    }
                }
            }
            out.push(serializedFloor.join(" "));
        }
        return out.join("\n");
    }
}



const parseLines = (lines: string[]): Building => {
    const floors = lines.map((line) => {
        const cleaned = line.replace(/[,.]/g, "").replace(/-[^ ]*/g, "").trim();
        const tokens = cleaned.split(" ");
        const floorOrdinal = tokens[1];
        const floorId: number = parseOrdinal(floorOrdinal);
        const generatorIndexes = tokens.map((e, i) => ({e, i})).filter((x) => x.e === "generator").map((x) => x.i - 1);
        const microchipIndexes = tokens.map((e, i) => ({e, i})).filter((x) => x.e === "microchip").map((x) => x.i - 1);
        const items: Item[] = [];
        for (const generatorIndex of generatorIndexes) {
            const x = {
                element: tokens[generatorIndex],
                type: "generator" as "generator",
            };
            items.push(x);
        }

        for (const microchipIndex of microchipIndexes) {
            const x = {
                element: tokens[microchipIndex],
                type: "chip" as "chip",
            };
            items.push(x);
        }

        return {items, floorId};
    });
    const building = new Building();
    building.setFloors(floors);
    return building;
};

const parseOrdinal = (ordinal: string): number => {
    const valid = ["first", "second", "third", "fourth"];
    const result = valid.indexOf(ordinal.toLowerCase());
    if (result >= 0) {
        return result;
    }
    throw new Error("Invalid ordinal: " + ordinal);
};

const toColumn = (item: Omit<Item, "column">): string => {
    const element = item.element === "promethium" ? "K" : item.element[0].toUpperCase();
    const type = item.type[0].toUpperCase();
    return `${element}${type}`;
};

const bringEverythingToFourth = (building: Building): number | null => {
    const queue = new Queue<{building: Building, steps: number}>();
    const visitedStates = new Set<string>();
    queue.add({building, steps: 0});
    while (!queue.isEmpty) {
        const node = queue.get()!;
        const serialized = node.building.serializeToEquivalent();
        if (visitedStates.has(serialized)) {
            continue;
        }
        visitedStates.add(serialized);
        const candidateItems = node.building.currentFloorItems();
        const candidatesToBring = subsetGenerator(candidateItems, 0, 2);
        for (const candidate of candidatesToBring) {
            if (candidate.length === 0) {
                continue;
            }
            if (node.building.isSubsetValid(candidate)) {
                for (const direction of ["up", "down"] as ["up", "down"]) {
                    const moved = node.building.move(candidate, direction);
                    const newSteps = node.steps + 1;
                    if (moved) {
                        if (moved.isAllOnLastFloor()) {
                            return newSteps;
                        } else {
                            queue.add({building: moved, steps: newSteps});
                        }
                    }
                }
            }
        }
    }
    return null;
};

export const radioisotopeThermoelectricGenerators = entryForFile(
    async ({ lines, outputCallback }) => {
        const building = parseLines(lines);
        await outputCallback(building.toString());

        await outputCallback(bringEverythingToFourth(building));
    },
    async ({ lines, outputCallback }) => {
        const building = parseLines(lines);
        const additionalElements: string[] = ["elerium", "dilithium"];
        const types: Array<"chip" | "generator"> = ["chip", "generator"];
        building.addToFloor(0, additionalElements.flatMap((e) => types.map((t) => ({
            element: e,
            type: t
        }))));

        await outputCallback(building.toString());

        await outputCallback(bringEverythingToFourth(building));
    },
    { key: "radioisotope-thermoelectric-generators", title: "Radioisotope Thermoelectric Generators", stars: 2}
);
