import { entryForFile } from "../../entry";

const findProd = (ns: number[], target: number, startFrom: number = 0): number | null => {
    let i = startFrom, j = ns.length-1;
    while (ns[i]+ns[j] !== target && i < j) {
        if (ns[i]+ns[j] > target) {
            j--;
        } else {
            i++;
        }
    }
    return i < j ? ns[i] * ns[j] : null;
}

export const reportRepair = entryForFile(
    async ({ lines, outputCallback }) => {
        const ns = lines.map(line => parseInt(line, 10)).sort((a, b) => a-b);
        const result = findProd(ns, 2020);
        if (result) {
            await outputCallback(result);
        } else {
            await outputCallback("Not found :(");
        }
    },
    async ({ lines, outputCallback }) => {
        const ns = lines.map(line => parseInt(line, 10)).sort((a, b) => a-b);
        for (let i = 0; i < ns.length; i++) {
            const result = findProd(ns, 2020 - ns[i], i+1);
            if (result) {
                await outputCallback(result * ns[i]);
                return;
            }
        }
        await outputCallback("Not found :(");

    },
    { key: "report-repair", title: "Report Repair", stars: 2}
);
