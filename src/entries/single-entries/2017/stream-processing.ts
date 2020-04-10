import { entryForFile } from "../../entry";
import { Stack } from 'linq-typescript';

type Group = Element[]; 
type Garbage = string; 
type Element = Group | Garbage;

let outI = 0;
const parseGarbage = (line: string, start: number): [Garbage, number] => {
    let isEscaped = false;
    let current: string[] = [];
    let currentIndex = start;
    while (true) {
        if (currentIndex >= line.length) {
            throw new Error("I got out of the bounds while garbaging o.o");
        }
        if (isEscaped) {
            isEscaped = false;
            currentIndex++;
        } else if (line[currentIndex] === "!") {
            isEscaped = true;
            currentIndex++;
        }
        else if (line[currentIndex] === ">") {
            return [current.join(""), currentIndex + 1];
        } else {
            current.push(line[currentIndex++]);
        }
    }
} 

export const parseGroup = (line: string, start: number = 1): [Group, number] => {
    let current: Group = [];
    let currentIndex = start;
    while (true) {
        if (currentIndex >= line.length) {
            console.log(current);
            throw new Error("I got out of the bounds while grouping o.o");
        }
        if (line[currentIndex] === "{") {
            const [group, suggestedIndex] = parseGroup(line, currentIndex + 1);
            current.push(group);
            currentIndex = suggestedIndex;
        } else if (line[currentIndex] === "}") {
            return [current, currentIndex + 1];
        } else if (line[currentIndex] === "<") {
            const [garbage, suggestedIndex] = parseGarbage(line, currentIndex + 1)
            current.push(garbage);
            currentIndex = suggestedIndex;
        } else if (line[currentIndex] === ",") {
            currentIndex++;
        } else {
            throw new Error("Invalid token while parsing group: " + line[currentIndex]);
        }
    }
}

const isGarbage = (element: Element): element is Garbage => {
    return (typeof element) === "string";
}

const score = (element: Element, baseScore: number = 0): number => {
    if (isGarbage(element)) {
        return 0;
    }
    const localScore = baseScore + 1;
    let additionalScore = element.reduce((acc, next) => score(next, localScore) + acc, 0);
    return localScore + additionalScore;
};

export const countGarbage = (element: Element): number => {
    if (isGarbage(element)) {
        return element.length;
    }
    return element.reduce((acc, next) => countGarbage(next) + acc, 0);
}
export const streamProcessing = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const line = lines[0];
        const result = parseGroup(line)[0];
        await outputCallback(score(result));
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const line = lines[0];
        const result = parseGroup(line)[0];
        await outputCallback(countGarbage(result));
    },
    { key: "stream-processing", title: "Stream Processing", stars: 2, }
);

