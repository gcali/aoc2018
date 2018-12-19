import { entryForFile } from "../entry";
import Best from "../../support/best";

const entry = entryForFile(
    lines => {
        if (lines.length > 1) {
            throw Error("Only one line expected");
        }
        let polymerText = lines[0];

        console.log("Start length: " + polymerText.length);
        polymerText = explodePolymer(polymerText);
        console.log(polymerText.length);

    },
    lines => {
        if (lines.length > 1) {
            throw Error("Only one line expected");
        }
        let polymerText = lines[0];

        let max = new Best<string>();
        let unitList = new Set<string>(polymerText.toLowerCase().split(""));
        polymerText = explodePolymer(polymerText);
        unitList.forEach(unit => {
            let cleanPolymer = polymerText.replace(new RegExp(`[${unit}${unit.toUpperCase()}]`, "g"), "");
            let exploded = explodePolymer(cleanPolymer);
            max.add({ key: polymerText.length - exploded.length, value: exploded });
        });
        console.log(max.currentBest.value.length);
    }
);

export default entry;

function explodePolymer(polymerText: string) {
    let i = 0;
    while (i < polymerText.length - 1) {
        if (polymerText[i] !== polymerText[i + 1] && polymerText[i].toLowerCase() === polymerText[i + 1].toLowerCase()) {
            polymerText = polymerText.slice(0, i) + polymerText.slice(i + 2);
            i = 0;
        }
        else {
            i++;
        }
    }
    return polymerText;
}
