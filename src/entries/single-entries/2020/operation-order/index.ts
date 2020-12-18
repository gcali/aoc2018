import { entryForFile } from "../../../entry";

type Token = string;

const getNumber = (token: Token): number | null => {
    const n = parseInt(token, 10);
    if (n.toString() === token) {
        return n;
    }
    return null;
};

type Operation = ((a: number, b: number) => number);

const getOperation = (token: Token): Operation | null => {
    if (token === "+") {
        return (a, b) => a + b;
    } else if (token === "*") {
        return (a, b) => a * b;
    } else {
        return null;
    }
};

const getExpressionParenth = (token: Token): "start" | "end" | null => {
    if (token === "(") {
        return "start";
    } else if (token === ")") {
        return "end";
    } else {
        return null;
    }
};

type FlatExpressionToken = number | "*" | "+";

const evaluateFlatExpression = (tokens: FlatExpressionToken[]): number => {
    const current: FlatExpressionToken[] = [...tokens];
    while (current.includes("+")) {
        const index = current.indexOf("+");
        const result = (current[index - 1] as number) + (current[index + 1] as number);
        current.splice(index - 1, 3, result);
    }
    let sum = 1;
    for (const token of current) {
        if (token !== "*") {
            if (token === "+") {
                throw new Error();
            }
            sum *= token;
        }
    }
    return sum;
};

const getFlatExpression = (tokens: Token[], startFrom: number): {expression: FlatExpressionToken[], next: number} => {
    const flat: FlatExpressionToken[] = [];
    while (startFrom < tokens.length) {
        const currentToken = tokens[startFrom];
        if (["*", "+"].includes(currentToken)) {
            flat.push(currentToken as "*" | "+");
            startFrom++;
            continue;
        }
        const n = getNumber(currentToken);
        if (n !== null) {
            flat.push(n);
            startFrom++;
            continue;
        }

        const startEnd = getExpressionParenth(currentToken);
        if (startEnd !== null) {
            if (startEnd === "start") {
                const nested = getFlatExpression(tokens, startFrom + 1);
                const value = evaluateFlatExpression(nested.expression);
                flat.push(value);
                startFrom = nested.next;
            } else {
                return {expression: flat, next: startFrom + 1};
            }
            continue;
        }
        throw new Error("Invalid expression");
    }
    return { expression: flat, next: startFrom };
};


const evaluateExpression = (tokens: Token[], startFrom: number): {result: number, next: number} => {
    let currentSum = 0;
    let currentOperation: Operation | null = null;
    while (startFrom < tokens.length) {
        const currentToken = tokens[startFrom];
        const operation = getOperation(currentToken);
        if (operation !== null) {
            currentOperation = operation;
            startFrom++;
            continue;
        }

        const n = getNumber(currentToken);
        if (n !== null) {
            if (currentOperation !== null) {
                currentSum = currentOperation(currentSum, n);
                currentOperation = null;
            } else {
                currentSum = n;
            }
            startFrom++;
            continue;
        }

        const startEnd = getExpressionParenth(currentToken);
        if (startEnd !== null) {
            if (startEnd === "end") {
                return {next: startFrom + 1, result: currentSum};
            } else {
                const nested = evaluateExpression(tokens, startFrom + 1);
                if (currentOperation !== null) {
                    currentSum = currentOperation(currentSum, nested.result);
                    currentOperation = null;
                } else {
                    currentSum = nested.result;
                }
                startFrom = nested.next;
            }
            continue;
        }

        throw new Error("Invalid token: " + currentToken);
    }
    return { result: currentSum, next: startFrom };
};

const parseLines = (lines: string[]): Token[][] => {
    return lines.map((line) => line.replaceAll(" ", "").split(""));
};

export const operationOrder = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        let sum = 0;
        for (const expression of input) {
            sum += evaluateExpression(expression, 0).result;
        }
        await outputCallback(sum);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const input = parseLines(lines);
        let sum = 0;
        for (const expression of input) {
            const flat = getFlatExpression(expression, 0).expression;
            const result = evaluateFlatExpression(flat);
            sum += result;
        }
        await outputCallback(sum);
    },
    {
        key: "operation-order",
        title: "Operation Order",
        supportsQuickRunning: true,
        embeddedData: true,
        stars: 2
    }
);
