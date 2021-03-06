import wu from "wu";
import { buildGroupsFromSeparator } from "../../../../support/sequences";
import { entryForFile } from "../../../entry";
import { buildVisualizer } from "./visualizer";
const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const result = new Set<T>();
    for (const e of a) {
        if (b.has(e)) {
            result.add(e);
        }
    }
    return result;
};

const buildAnswers = (line: string, set?: Set<string> | undefined): Set<string> => {
    if (set === undefined) {
        set = new Set<string>();
    }
    line.split("").forEach((l) => set!.add(l));
    return set;
};

export const customCustoms = entryForFile(
    async ({
        lines,
        resultOutputCallback,
        setAutoStop,
        pause,
        screen
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const groups = [...buildGroupsFromSeparator(lines, (l) => l.length === 0)];
        await visualizer.setup(groups.length);
        let total = 0;
        for (let i = 0; i < groups.length; i++) {
            await visualizer.startGroup(i);
            const group = groups[i];
            const answers = group.reduce((acc, next) => buildAnswers(next, acc), new Set<string>());
            for (const letter of answers) {
                await visualizer.addLetter(i, letter);
            }
            await visualizer.endGroup(i);
            total += answers.size;
        }
        await resultOutputCallback(total);
    },
    async ({
        lines,
        resultOutputCallback,
        setAutoStop,
        screen,
        pause
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const groups = [...buildGroupsFromSeparator(lines, (l) => l.length === 0)];
        await visualizer.setup(groups.length);

        let total = 0;
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            await visualizer.startGroup(i);
            let answers: Set<string> | undefined;
            for (const line of group) {
                if (answers === undefined) {
                    answers = buildAnswers(line);
                } else {
                    answers = intersect(answers, buildAnswers(line));
                }
                await visualizer.setLetters(i, answers);
            }
            if (answers) {
                total += answers.size;
            }
        }

        await resultOutputCallback(total);
    },
    {
        key: "custom-customs",
        title: "Custom Customs",
        stars: 2,
        suggestedDelay: 10,
        customComponent: "pause-and-run",
        supportsQuickRunning: true,
        embeddedData: true
    }
);
