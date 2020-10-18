import { TimeCalculator } from "../../../support/time";
import { subsetGenerator } from "../../../support/sequences";
import { entryForFile } from "../../entry";

const parseLines = (lines: string[]): number[] => {
    return lines.map((line) => parseInt(line, 10));
};

export const itHangsInTheBalance = entryForFile(
    async ({ lines, outputCallback }) => {
        const packages = parseLines(lines);
        const totalWeight = packages.reduce((a, b) => a + b);

        const target = totalWeight / 3;

        let subsets = 0;
        const expectedTotal = 2 ** packages.length;
        const interestingSubsets: number[][] = [];
        const timeCalculator = new TimeCalculator();
        timeCalculator.start();
        for (let size = 1; size < packages.length - 2; size++) {
            for (const s of subsetGenerator(packages, 0, size)) {
                if (s.length > 0 && s.reduce((a, b) => a + b, 0) === target) {
                    interestingSubsets.push(s);
                }
                subsets++;
                if (subsets % 10000000 === 0) {
                    await outputCallback("Remaining " + timeCalculator.getExpectedSerialized(subsets / expectedTotal));
                }
            }

            const sorted = interestingSubsets
                .map((e) => ({ e, i: e.reduce((a, b) => a * b, 1) }))
                .sort((a, b) => a.i - b.i)
                .map((e) => e.e);

            for (const candidate of sorted) {
                const rest = packages.filter((e) => candidate.indexOf(e) < 0);
                for (const s of subsetGenerator(rest, 0)) {
                    if (s.reduce((a, b) => a + b, 0) === target) {
                        await outputCallback("Found it! " + (candidate.reduce((a, b) => a * b, 1)));
                        return;
                    }
                }
            }
        }
        await outputCallback("Sad :(");

    },
    async ({ lines, outputCallback }) => {
        const packages = parseLines(lines);
        const totalWeight = packages.reduce((a, b) => a + b);

        const target = totalWeight / 4;

        let subsets = 0;
        const expectedTotal = 2 ** packages.length;
        const interestingSubsets: number[][] = [];
        const timeCalculator = new TimeCalculator();
        timeCalculator.start();
        for (let size = 1; size < packages.length - 2; size++) {
            for (const s of subsetGenerator(packages, 0, size)) {
                if (s.length > 0 && s.reduce((a, b) => a + b, 0) === target) {
                    interestingSubsets.push(s);
                }
                subsets++;
                if (subsets % 10000000 === 0) {
                    await outputCallback("Remaining " + timeCalculator.getExpectedSerialized(subsets / expectedTotal));
                }
            }

            const sorted = interestingSubsets
                .map((e) => ({ e, i: e.reduce((a, b) => a * b, 1) }))
                .sort((a, b) => a.i - b.i)
                .map((e) => e.e);

            for (const candidate of sorted) {
                const rest = packages.filter((e) => candidate.indexOf(e) < 0);
                for (const s of subsetGenerator(rest, 0)) {
                    if (s.reduce((a, b) => a + b, 0) === target) {
                        const trunkCandidates = rest.filter((e) => s.indexOf(e) < 0);
                        for (const t of subsetGenerator(trunkCandidates, 0)) {
                            if (t.reduce((a, b) => a + b, 0) === target) {
                                await outputCallback("Found it! " + (candidate.reduce((a, b) => a * b, 1)));
                                return;
                            }
                        }
                    }
                }
            }
        }
        await outputCallback("Sad :(");
    },
    { key: "it-hangs-in-the-balance", title: "It Hangs in the Balance", stars: 2 }
);
