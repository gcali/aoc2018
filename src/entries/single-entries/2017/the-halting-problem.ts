import { entryForFile } from "../../entry";
import { NotImplementedError } from "../../../support/error";
import { groupBy } from "../../../support/sequences";
import { parseGroup } from "./stream-processing";

type Cell = 0 | 1;

type Direction = -1 | 1;

interface Input {
    machine: TuringMachine;
    steps: number;
}

interface TuringRule {
    write: Cell;
    direction: Direction;
    nextState: string;
}

interface TuringState {
    state: string;
    0: TuringRule;
    1: TuringRule;
}

interface TuringData {
    mainTape: Cell[];
    negativeTape: Cell[];
}

interface TuringInstance {
    data: TuringData;
    position: number;
    nextState: string;
}

interface TuringMachine {
    instance: TuringInstance;
    states: TuringState[];
}

const getTape = (turingData: TuringData, position: number): Cell[] => {
    const tape = position >= 0 ? turingData.mainTape : turingData.negativeTape;
    return tape;
};

const getCell = (turingData: TuringData, position: number): Cell => {
    const tape = getTape(turingData, position);
    return tape[Math.abs(position)] || 0;
};

const setCell = (turingData: TuringData, position: number, cell: Cell): TuringData => {
    const tape = getTape(turingData, position);
    tape[Math.abs(position)] = cell;
    return turingData;
};

const calculateStep = (machine: TuringMachine) => {
    const nextState = machine.instance.nextState;
    const matchingState = machine.states.filter((states) => states.state === nextState)[0];
    const currentCell = getCell(machine.instance.data, machine.instance.position);
    const matchingRule = matchingState[currentCell];
    setCell(machine.instance.data, machine.instance.position, matchingRule.write);
    machine.instance.position += matchingRule.direction;
    machine.instance.nextState = matchingRule.nextState;
};

const getLastWord = (s: string, delta: number = 0): string => {
    const tokens = s.trim().split(" ");
    const lastToken = tokens[tokens.length - delta - 1];
    return (lastToken.endsWith(".") || lastToken.endsWith(":")) ?
        lastToken.slice(0, -1) :
        lastToken;
};

const getLastNumber = (s: string): number => {
    return parseInt(getLastWord(s), 10);
};

const getLastCell = (s: string): Cell => {
    const number = getLastNumber(s);
    if (number !== 0 && number !== 1) {
        throw new Error("Invalid cell: " + number);
    }
    return number;
};

const parseRule = (group: string[]): TuringRule => {
    if (group.length !== 3) {
        throw new Error("Invalid group");
    }
    return {
        write: getLastCell(group[0]),
        direction: getLastWord(group[1]) === "right" ? 1 : -1,
        nextState: getLastWord(group[2])
    };
};

const parseInput = (lines: string[]): Input => {
    const startState = getLastWord(lines[0]);
    const steps = parseInt(getLastWord(lines[1], 1), 10);
    lines = lines.slice(2);
    const states: TuringState[] = groupBy(lines, 10).map((group) => {
        group = group.slice(1);
        const state = getLastWord(group[0]);
        const rs = [0, 1].map((i) => {
            const key = getLastCell(group[i * 4 + 1]);
            const rules = parseRule(group.slice(i * 4 + 2, i * 4 + 5));
            return {
                [0]: rules
            };
        });
        return {
            state,
            0: parseRule(group.slice(2, 5)),
            1: parseRule(group.slice(6, 9))
        };
    });
    return {
        steps,
        machine: {
            states,
            instance: {
                data: {
                    mainTape: [],
                    negativeTape: []
                },
                nextState: startState,
                position: 0
            }
        }
    };
};

const calculateChecksum = (machine: TuringMachine): number => {
    return machine.instance.data.mainTape.reduce((acc: number, next) => acc + next, 0) +
    machine.instance.data.negativeTape.reduce((acc: number, next) => acc + next, 0);

};

export const haltingProblem = entryForFile(
    async ({ lines, outputCallback }) => {
        const input = parseInput(lines);
        const machine = input.machine;
        for (let i = 0; i < input.steps; i++) {
            calculateStep(machine);
        }
        const checksum = calculateChecksum(machine);
        await outputCallback(checksum);
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "the-halting-problem", title: "The Halting Problem", stars: 2, }
);
