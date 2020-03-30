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

const visit = (directions: Directions): string[] => {
    if (directions.length === 0) {
        return [""];
    }
    const firstElement = directions[0];
    const head = isGroup(firstElement) ? firstElement.flatMap(visit) : [firstElement];
    const rest = visit(directions.slice(1)); 
    return head.flatMap(element => rest.map(tail => element.concat(tail)));
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
        // await outputCallback(JSON.stringify(parsed));
        await outputCallback(visit(parsed));
    },
    async ({ lines, outputCallback }) => {
    }
);
