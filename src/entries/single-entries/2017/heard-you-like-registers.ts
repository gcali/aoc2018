import { entryForFile } from "../../entry";
import { DefaultListDictionaryString } from "../../../support/data-structure";
type Operation = "inc" | "dec";
type Operator = ">" | "<" | ">=" | "<=" | "==" | "!=";
interface Condition {
    left: string;
    operator: Operator;
    right: number;
}

interface Action {
    target: string;
    operation: Operation;
    amount: number;
}
interface Instruction {
    action: Action;
    condition: Condition;
}
class RegisterState {

    public currentMax: number = Number.NEGATIVE_INFINITY;
    private readonly state = new Map<string, number>();

    public update(register: string, calc: (v: number) => number) {
        const existing = this.state.get(register) || 0;
        const newValue = calc(existing);
        this.currentMax = Math.max(this.currentMax, newValue);
        this.state.set(register, newValue);
    }

    public get(register: string): number {
        const existing = this.state.get(register);
        if (existing === undefined) {
            this.state.set(register, 0);
            return 0;
        }
        return existing;
    }

    public getValues(): number[] {
        return [...this.state.values()];
    }
}

const checkCondition = (condition: Condition, state: RegisterState): boolean => {
    const leftValue = state.get(condition.left);
    switch (condition.operator) {
        case "!=":
            return leftValue != condition.right;
        case "<":
            return leftValue < condition.right;
        case "<=":
            return leftValue <= condition.right;
        case "==":
            return leftValue == condition.right;
        case ">":
            return leftValue > condition.right;
        case ">=":
            return leftValue >= condition.right;
    }
    throw new Error("Invalid operator " + condition.operator);
};

const updateState = (action: Action, state: RegisterState) => {
    state.update(
        action.target,
        (value) => action.operation === "dec" ?
                    value - action.amount :
                    value + action.amount
        );
};

export const heardYouLikeRegisters = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const state = new RegisterState();
        const instructions = parseInstructions(lines);
        executeInstructions(instructions, state);

        const maxValue = state.getValues().reduce((acc, next) => Math.max(acc, next));
        await outputCallback(maxValue);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const state = new RegisterState();
        const instruction = parseInstructions(lines);
        executeInstructions(instruction, state);
        await outputCallback(state.currentMax);
    },
    { key: "heard-you-like-registers", title: "I Heard You Like Registers", stars: 2, }
);

function executeInstructions(instructions: Instruction[], state: RegisterState) {
    instructions.forEach((instruction) => {
        if (checkCondition(instruction.condition, state)) {
            updateState(instruction.action, state);
        }
    });
}

function parseInstructions(lines: string[]) {
    return lines.map((line: string): Instruction => {
        const tokens = line.split(" ").map((e) => e.trim());
        return {
            action: {
                target: tokens[0],
                operation: tokens[1] as Operation,
                amount: parseInt(tokens[2], 10),
            },
            condition: {
                left: tokens[4],
                operator: tokens[5] as Operator,
                right: parseInt(tokens[6], 10)
            }
        };
    });
}

