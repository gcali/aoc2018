import { CCoordinate, Coordinate, directions, manhattanDistance, rotate, serialization } from "../../../../support/geometry";
import { entryForFile } from "../../../entry";

const validDirections = [
"N" , "S" , "E" , "W" , "L" , "R" , "F"
];

const isValidDirection = (d: string): d is Direction => {
    return validDirections.includes(d);
}

type Direction = "N" | "S" | "E" | "W" | "L" | "R" | "F";
type Movement = {
    direction: Direction,
    magnitude: number
}

type State = {
    position: Coordinate,
    direction: CCoordinate
}

const parseLines = (lines: string[]): Movement[] => {
    return lines.map(line => {
        const d = line[0];
        if (!isValidDirection(d)) {
            throw new Error("Invalid direction");
        }
        let magnitude = parseInt(line.slice(1));
        if (d === "R" || d === "L") {
            if (magnitude % 90 !== 0) {
                throw new Error("Invalid magnitude");
            }
            magnitude = magnitude / 90;
        }
        return {
            direction: d,
            magnitude
        };
    })
}

type WaypointState = {
    shipCoordinate: Coordinate,
    waypointCoordinate: CCoordinate,
};

const updateWaypointState = (state: WaypointState, movement: Movement): WaypointState => {
    const result = {...state};
    switch (movement.direction) {
        case "E":
            result.waypointCoordinate = directions.right.times(movement.magnitude).sum(state.waypointCoordinate);
            break;
        case "W":
            result.waypointCoordinate = directions.left.times(movement.magnitude).sum(state.waypointCoordinate);
            break;
        case "N":
            result.waypointCoordinate = directions.up.times(movement.magnitude).sum(state.waypointCoordinate);
            break;
        case "S":
            result.waypointCoordinate = directions.down.times(movement.magnitude).sum(state.waypointCoordinate);
            break;
        case "L":
            result.waypointCoordinate = rotate(state.waypointCoordinate, "Counterclockwise", movement.magnitude);
            break;
        case "R":
            result.waypointCoordinate = rotate(state.waypointCoordinate, "Clockwise", movement.magnitude);
            break;
        case "F":
            result.shipCoordinate = state.waypointCoordinate.times(movement.magnitude).sum(state.shipCoordinate);
            break;
    }
    return result;
}

const updateState = (state: State, movement: Movement): State => {
    const result = {...state};
    switch (movement.direction) {
        case "E":
            result.position = directions.right.times(movement.magnitude).sum(state.position);
            break;
        case "W":
            result.position = directions.left.times(movement.magnitude).sum(state.position);
            break;
        case "N":
            result.position = directions.up.times(movement.magnitude).sum(state.position);
            break;
        case "S":
            result.position = directions.down.times(movement.magnitude).sum(state.position);
            break;
        case "L":
            result.direction = rotate(state.direction, "Counterclockwise", movement.magnitude);
            break;
        case "R":
            result.direction = rotate(state.direction, "Clockwise", movement.magnitude);
            break;
        case "F":
            result.position = state.direction.times(movement.magnitude).sum(state.position);
            break;
    }
    return result;
}

export const rainRisk = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        let state: State = {position: {x:0, y:0}, direction: directions.right};
        for (const movement of input) {
            state = updateState(state, movement);
        }
        await resultOutputCallback(manhattanDistance(state.position, {x: 0, y: 0}));
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        let state: WaypointState = {
            shipCoordinate: {x:0, y:0}, 
            waypointCoordinate: new CCoordinate(10, -1)
        };
        for (const movement of input) {
            state = updateWaypointState(state, movement);
        }
        await resultOutputCallback(manhattanDistance(state.shipCoordinate, {x: 0, y: 0}));
    },
    { key: "rain-risk", title: "Rain Risk", embeddedData: true, supportsQuickRunning: true}
);