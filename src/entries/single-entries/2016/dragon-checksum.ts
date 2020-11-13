import { groupBy } from "../../../support/sequences";
import { entryForFile } from "../../entry";

export const dragonStep = (data: string): string => {
    const tokens = data.split("").reverse().map((e) => e === "0" ? "1" : "0");
    return [data, "0"].concat(tokens).join("");
};

const fillDisk = (data: string, length: number): string => {
    while (data.length < length) {
        data = dragonStep(data);
    }
    return data.length === length ? data : data.slice(0, length);
};

export const checksum = (data: string): string => {
    if (data.length % 2 === 1) {
        return data;
    }
    const result: string[] = [];
    for (let i = 0; i < data.length; i += 2) {
        result.push(data[i] === data[i + 1] ? "1" : "0");
    }
    return checksum(result.join(""));
};

export const dragonEverything = (data: string, diskSize: number): string => {
    data = fillDisk(data, diskSize);
    return checksum(data);
};

export const dragonChecksum = entryForFile(
    async ({ lines, outputCallback }) => {
        const checksum = dragonEverything(lines[0], 272);
        await outputCallback(checksum);
    },
    async ({ lines, outputCallback }) => {
        const checksum = dragonEverything(lines[0], 35651584);
        await outputCallback(checksum);
    },
    { key: "dragon-checksum", title: "Dragon Checksum", stars: 2}
);
