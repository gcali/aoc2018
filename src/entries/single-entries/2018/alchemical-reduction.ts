import { oldEntryForFile } from "../../entry";
import Best from "../../../support/best";
// import { log } from "../../support/log";

export const entry = oldEntryForFile(
    async (lines, outputCallback) => {
        if (lines.length > 1) {
            throw Error("Only one line expected");
        }
        let polymerText = lines[0];

        await outputCallback("Start length: " + polymerText.length);
        polymerText = explodePolymer(polymerText);
        await outputCallback(polymerText.length);

    },
    async (lines, outputCallback) => {
        if (lines.length > 1) {
            throw Error("Only one line expected");
        }
        let polymerText = lines[0];

        const max = new Best<string>();
        const unitList = new Set<string>(polymerText.toLowerCase().split(""));
        polymerText = explodePolymer(polymerText);
        unitList.forEach((unit) => {
            const cleanPolymer = polymerText.replace(new RegExp(`[${unit}${unit.toUpperCase()}]`, "g"), "");
            const exploded = explodePolymer(cleanPolymer);
            max.add({ key: polymerText.length - exploded.length, value: exploded });
        });
        await outputCallback(max.currentBest!.value.length);
    },
);

function explodePolymer(polymerText: string) {
    let i = 0;
    while (i < polymerText.length - 1) {
        if (polymerText[i] !== polymerText[i + 1]
            && polymerText[i].toLowerCase() === polymerText[i + 1].toLowerCase()
        ) {
            polymerText = polymerText.slice(0, i) + polymerText.slice(i + 2);
            i = 0;
        } else {
            i++;
        }
    }
    return polymerText;
}
