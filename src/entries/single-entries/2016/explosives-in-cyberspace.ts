import { entryForFile } from "../../entry";

const parseLines = (lines: string[]): string => {
    return lines.map(e => e.trim()).join("");
}

const countExpandedLength = (line: string): number => {
    let count = 0;
    let i = 0;
    while (i < line.length) {
        if (line[i] === "(") {
            const markerEnd = line.indexOf(")", i);
            const marker = line.slice(i+1, markerEnd);
            const [size,repeat] = marker.split("x").map(e => parseInt(e, 10));
            const toRepeat = line.slice(markerEnd+1, markerEnd+1+size);
            i = markerEnd+1+size;
            const nestedLength = countExpandedLength(toRepeat);
            count += (nestedLength * repeat);
        } else {
            count++;
            i++;
        }
    }
    return count;
}

const expand = (line: string): string => {
    const result: string[] = [];
    let i = 0;
    while (i < line.length) {
        if (line[i] === "(") {
            const markerEnd = line.indexOf(")", i);
            const marker = line.slice(i+1, markerEnd);
            const [size,repeat] = marker.split("x").map(e => parseInt(e, 10));
            const toRepeat = line.slice(markerEnd+1, markerEnd+1+size);
            for (let x = 0; x < repeat; x++) {
                result.push(toRepeat);
            }
            i = markerEnd+1+size;
        } else {
            result.push(line[i]);
            i++;
        }
    }
    return result.join("");
};

export const explosivesInCyberspace = entryForFile(
    async ({ lines, outputCallback }) => {
        const line = parseLines(lines);
        await outputCallback(expand(line).length);
    },
    async ({ lines, outputCallback }) => {
        const line = parseLines(lines);
        await outputCallback(countExpandedLength(line));
    },
    { key: "explosives-in-cyberspace", title: "Explosives in Cyberspace", stars: 2}
);