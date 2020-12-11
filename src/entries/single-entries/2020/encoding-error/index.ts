import { LinkedList } from "../../../../support/data-structure";
import { entryForFile } from "../../../entry";
import { buildVisualizer, IEncodingErrorVisualizer } from "./visualizer";

const findInvalid = async (ns: number[], visualizer?: IEncodingErrorVisualizer): Promise<number | null> => {
    for (let i = 25; i < ns.length; i++) {
        if (visualizer) {
            await visualizer.setCurrent(i);
        }
        const target = ns[i];
        const lookingFor = new Set<number>();
        let found = false;
        if (visualizer) {
            await visualizer.changeBag(ns.slice(i - 25, i));
        }
        for (let j = i - 25; j < i; j++) {
            if (lookingFor.has(ns[j])) {
                if (visualizer) {
                    await visualizer.setWinnerBag(j - (i - 25));
                }
                found = true;
                break;
            } else {
                if (visualizer) {
                    await visualizer.setCalculatedBag(j - (i - 25));
                }
                lookingFor.add(target - ns[j]);
            }
        }
        if (!found) {
            if (visualizer) {
                await visualizer.setInvalid(i);
            }
            return target;
        }
    }
    return null;
};

export const encodingError = entryForFile(
    async ({
        lines,
        resultOutputCallback,
        screen,
        pause,
        setAutoStop
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const ns = lines.map((l) => parseInt(l, 10));
        await visualizer.setupInvalidFinder(ns, ns.slice(0, 25));
        const invalid = await findInvalid(ns, screen && visualizer);
        await resultOutputCallback(ns === null ? "Did not find it :(" : invalid);
    },
    async ({
        lines,
        resultOutputCallback ,
        outputCallback,
        screen,
        pause,
        setAutoStop
    }) => {
        setAutoStop();
        const ns = lines.map((l) => parseInt(l, 10));
        const visualizer = buildVisualizer(screen, pause);
        await visualizer.setupWeakness(ns);

        const invalid = await findInvalid(ns);
        if (invalid === null) {
            throw new Error("Could not find invalid");
        }
        const sums = new LinkedList<{min: number, max: number, value: number, i: number}>();
        let i = 0;
        for (const n of ns) {
            await visualizer.setCurrent(i);
            for (const sum of sums) {
                sum.element.value += n;
                sum.element.min = Math.min(n, sum.element.min);
                sum.element.max = Math.max(n, sum.element.max);
                if (sum.element.value === invalid) {
                    await visualizer.setWinnerBag(sum.element.i);
                    await resultOutputCallback(sum.element.min + sum.element.max);
                    return;
                } else if (sum.element.value > invalid) {
                    await visualizer.setWrongBag(sum.element.i);
                    sum.remove();
                } else {
                    await visualizer.updateBagSize(sum.element.i, sum.element.value);
                }
            }
            const node = {min: n, max: n, value: n, i: i++};
            sums.addNode(node);
            await visualizer.addBagItem(n);
        }
        await resultOutputCallback("Could not find it");
    },
    {
        key: "encoding-error",
        title: "Encoding Error",
        stars: 2,
        supportsQuickRunning: true,
        suggestedDelay: 15,
        customComponent: "pause-and-run",
        embeddedData: true
    }
);
