import { entryForFile } from "../../entry";

const findCombinations = (quantities: number[], amount: number, index: number, selected: number): number[] => {
    if (amount === 0) {
        return [selected];
    }
    if (index >= quantities.length) {
        return [];
    }
    if (amount < quantities[index]) {
        return findCombinations(quantities, amount, index + 1, selected);
    }
    return findCombinations(quantities, amount, index + 1, selected).concat(
           findCombinations(quantities, amount - quantities[index], index + 1, selected + 1)
    );
};

export const noSuchThingAsTooMuch = entryForFile(
    async ({ lines, outputCallback }) => {
        const quantities = lines.map((e) => parseInt(e, 10)).sort((a, b) => b - a);
        await outputCallback(findCombinations(quantities, 150, 0, 0).length);
    },
    async ({ lines, outputCallback }) => {
        const quantities = lines.map((e) => parseInt(e, 10)).sort((a, b) => b - a);
        const selected = findCombinations(quantities, 150, 0, 0).sort((a, b) => a - b);
        const min = selected[0];
        await outputCallback(selected.filter((e) => e === min).length);
    },
    { key: "no-such-thing-as-too-much", title: "No Such Thing as Too Much", stars: 2}
);
