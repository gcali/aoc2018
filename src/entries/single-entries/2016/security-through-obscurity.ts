import { entryForFile } from "../../entry";

interface Room {
    encryptedName: string;
    sectorID: number;
    checksum: string;
}

const parseLines = (lines: string[]): Room[] => {
    return lines.map((line) => {
        const dashIndex = line.lastIndexOf("-");
        const squareIndex = line.lastIndexOf("[");
        const name = line.slice(0, dashIndex);
        const sectorID = parseInt(line.slice(dashIndex + 1, squareIndex), 10);
        const checksum = line.slice(squareIndex + 1, -1);
        return {
            encryptedName: name,
            sectorID,
            checksum
        };
    });
};

const decrypt = (room: Room): string => {
    const mod = "z".charCodeAt(0) - "a".charCodeAt(0) + 1;

    const newName = [...room.encryptedName].map((e) => {
        if (e === "-") {
            return e;
        }
        return String.fromCharCode(((e.charCodeAt(0) - "a".charCodeAt(0) + room.sectorID) % mod) + "a".charCodeAt(0));
    });
    return newName.join("");
};

const verifyChecksum = (room: Room): boolean => {
    const frequency = new Map<string, number>();

    for (const letter of room.encryptedName) {
        if (letter !== "-") {
            const value = frequency.get(letter) || 0;
            frequency.set(letter, value + 1);
        }
    }

    const result = [...frequency.entries()].sort((a, b) => {
        if (b[1] === a[1]) {
            return a[0].localeCompare(b[0]);
        } else {
            return b[1] - a[1];
        }
    });

    const calculated = result.slice(0, 5).map((e) => e[0]).join("") ;

    return calculated === room.checksum;

};

export const securityThroughObscurity = entryForFile(
    async ({ lines, outputCallback }) => {
        const input = parseLines(lines);

        const count = input.filter(verifyChecksum).map((e) => e.sectorID).reduce((a, b) => a + b);

        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        const input = parseLines(lines);

        const res = input.map((i) => {
            return [decrypt(i), i.sectorID] as [string, number];
        });

        const candidates = res.filter((e) => e[0].includes("pole"));

        await outputCallback(candidates);
        await outputCallback("");
        await outputCallback(res);
    },
    { key: "security-through-obscurity", title: "Security Through Obscurity", stars: 2}
);
