import { entryForFile } from "../../entry";

type DetectionData = {[key: string]: number};
const ticket: DetectionData = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1
}; 

interface Sue {
    id: number;
    data: DetectionData;
}

const parseSues = (lines: string[]): Sue[] => {
    return lines.map(line => {
        const firstSeparator = line.indexOf(":");
        const left = line.slice(0, firstSeparator);
        const right = line.slice(firstSeparator + 2);
        const id = parseInt(left.split(" ")[1], 10);
        const data = right.split(", ").map(e => {
            const split = e.split(": ");
            return {
                name: split[0],
                value: parseInt(split[1])
            };
        }).reduce((acc: DetectionData, next) => {
            acc[next.name] = next.value;
            return acc
        }, {});
        return {
            id,
            data
        };
    });
};

const checkSue = (sue: Sue, ticket: DetectionData): boolean => {
    for (const key of Object.keys(sue.data)) {
        if (sue.data[key] !== ticket[key]) {
            return false;
        }
    }
    return true;
};

const checkSueRanges = (sue: Sue, ticket: DetectionData): boolean => {
    for (const key of Object.keys(sue.data)) {
        if (key === "cats" || key === "trees") {
            if (sue.data[key] <= ticket[key]) {
                return false;
            }
        } else if (key === "pomeranians" || key === "goldfish") {
            if (sue.data[key] >= ticket[key]) {
                return false;
            }
        } else {
            if (sue.data[key] !== ticket[key]) {
                return false;
            }
        }
    }
    return true;
};

export const auntSue = entryForFile(
    async ({ lines, outputCallback }) => {
        const sues = parseSues(lines);
        for (const sue of sues) {
            if (checkSue(sue, ticket)) {
                await outputCallback("Found Sue: " + sue.id);
                return;
            }
        }
        await outputCallback("Sue not found");
    },
    async ({ lines, outputCallback }) => {
        const sues = parseSues(lines);
        for (const sue of sues) {
            if (checkSueRanges(sue, ticket)) {
                await outputCallback("Found Sue: " + sue.id);
                return;
            }
        }
        await outputCallback("Sue not found");
    },
    { key: "aunt-sue", title: "Aunt Sue", stars: 2}
);