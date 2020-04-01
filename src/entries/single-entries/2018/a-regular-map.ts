import { entryForFile } from "../../entry";
import { NotImplementedError } from '../../../support/error';

type DirectionGroup = Directions[]; 
type Directions = (string | DirectionGroup)[];

const parseGroup = (line: string, index: number): [DirectionGroup, number] => {
    const groups: string[] = [];
    let currentGroup: string[] = [];
    index++;
    let openCount = 0;
    while (index < line.length) {
        const currentChar = line[index];
        if (openCount > 0) {
            currentGroup.push(line[index]);
            if (currentChar === "(") {
                openCount++;
            } else if (currentChar === ")") {
                openCount--;
            }
        } else {
            if (currentChar === "(") {
                openCount++;
                currentGroup.push(currentChar);
            } else if (currentChar === ")") {
                break;
            } else if (currentChar === "|") {
                groups.push(currentGroup.join(""));
                currentGroup = [];
            } else {
                currentGroup.push(currentChar);
            }
        }
        index++;
    }
    if (line[index] !== ")") {
        throw new Error("Error while parsing, group not ended");
    }
    groups.push(currentGroup.join(""));
    return [groups.map(group => parse(group)), index];
};

const isGroup = (d: (string | DirectionGroup)): d is DirectionGroup => {
    return Array.isArray(d);
}

const visit = async (directions: Directions, prefix: string[], visitCallback: (line: string[]) => Promise<void>): Promise<void> => {
    if (directions.length === 0) {
        return await visitCallback(prefix);
    }
    const firstElement = directions[0];
    if (isGroup(firstElement)) {
        for (const group of firstElement) {
            await visit(group, prefix, async result => await visit(directions.slice(1), result, visitCallback));
        }
    } else {
        await visit(directions.slice(1), prefix.concat([firstElement]), visitCallback);
    }
};

const parse = (line: string): Directions => {
    let i = 0;
    const directions: Directions = [];
    while ( i < line.length) {
        if (line[i] !== "(") {
            directions.push(line[i]);
        } else {
            const [group, endIndex] = parseGroup(line, i);
            i = endIndex;
            directions.push(group);
        }
        i++;
    }
    return directions;
};


export const aRegularMap = entryForFile(
    async ({ lines, outputCallback }) => {
        const parsed = parse(lines[0]);
        await visit(parsed, [], async e => await outputCallback(e.join("")));
    },
    async ({ lines, outputCallback }) => {
    }
);
