import { entryForFile } from "../../entry";
import { UnknownSizeField } from "../../../support/field";

type Regex = Array<Token | Regex[]>;
type Token = string;

function isToken(t: Token | Regex[]): t is Token {
    return typeof (t) === "string";
}

export function parseLines(lines: string[]): Regex {
    const tokenList = lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => l.slice(1, l.length - 1))
        .join("")
        .split("");
    return parseRegex(tokenList);
}

export function serializeRegex(regex: Regex): string {
    return regex.map((t) => {
        if (isToken(t)) {
            return t;
        } else {
            return `(${t.map(serializeRegex).join("|")})`;
        }
    }).join("");
}

function parseTokens(tokens: string[], startIndex: number): [Regex[], number] {
    let currentIndex = startIndex;
    const result: Regex[] = [];
    let current: Regex = [];
    while (currentIndex < tokens.length) {
        const currentToken = tokens[currentIndex++];
        if (currentToken === "(") {
            const [group, newIndex] = parseTokens(tokens, currentIndex);
            current.push(group);
            currentIndex = newIndex;
        } else if (currentToken === "|") {
            result.push(current);
            current = [];
        } else if (currentToken === ")") {
            break;
        } else {
            current.push(currentToken);
        }
    }
    if (current.length > 0) {
        result.push(current);
    }
    return [result, currentIndex];
}

function parseRegex(token: string[]): Regex {
    const [regex, _] = parseTokens(token, 0);
    if (regex.length !== 1) {
        throw new RangeError("Regex had to have one root!");
    }
    return regex[0];
}

type FieldCell = "." | "|" | "-" | "#";

function buildField(regex: Regex, field: UnknownSizeField<FieldCell> = new UnknownSizeField<FieldCell>()) {
    // const field = new UnknownSizeField<FieldCell>();
}

export const aRegularMap = entryForFile(
    async ({ lines, outputCallback }) => {
        const regex = parseLines(lines);
        const serialized = serializeRegex(regex);
        await outputCallback(serialized);
    },
    async ({ lines, outputCallback }) => {
    }
);
