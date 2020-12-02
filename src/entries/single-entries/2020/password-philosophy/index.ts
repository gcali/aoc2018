/*
8:46
Alright, let's start this.

So, the password validation puzzles are back. I haven't actually enjoyed these too much in the previous years, 
but we're still at the second day, nothing exciting expected. 
I decided yesterday to try and do visualizations for each day, but I'm actually not sure
what I could do here, I'll think about it later.

8:54
Ok, first star done, easy as expected, I think that I've done it in about 6 minutes after the scaffolding.

9:00
And done. I did a stupid error (adding 1 instead of subtracting 1 to the index), losing a lot of time. That's it for the 
problem solving part, not much to optimize here, I'll try and think of a visualization later on
*/

type PasswordLine = {
    password: string;
    minRepetitions: number;
    maxRepetitions: number;
    letter: string;
};

const parseLines = (lines: string[]): PasswordLine[] =>
    lines.map(line => {
        const [header, password] = line.split(": ");
        const [repetitions, letter] = header.split(" ");
        const [minRepetitions,maxRepetitions] = repetitions.split("-").map(e => parseInt(e, 10));
        return {
            letter,
            minRepetitions,
            maxRepetitions,
            password
        };
    });

type PasswordChecker = (passwordLine: PasswordLine) => [boolean, number[]];

const isLineValid: PasswordChecker = (passwordLine) => {
    const repetitions = passwordLine.password.split("").map((e,i) => ({e,i})).filter(e => e.e === passwordLine.letter);
    const isValid = repetitions.length <= passwordLine.maxRepetitions && repetitions.length >= passwordLine.minRepetitions;
    return [isValid, repetitions.map(e => e.i)];
}

const isLineReallyValid: PasswordChecker = (passwordLine) => {
    const targetIndexes = [passwordLine.minRepetitions, passwordLine.maxRepetitions]
        .map(e => e-1);
    const targets = targetIndexes
        .map(e => passwordLine.password[e]);
    const matching = targets.filter(e => e === passwordLine.letter).length;
    return [matching === 1, targetIndexes];
};

import { entryForFile, Pause, ScreenBuilder } from "../../../entry";
import { buildVisualizer } from './visualizer';

export const passwordPhilosophy = entryForFile(
    async ({ lines, outputCallback, screen, pause }) => {
        await runEntry(screen, pause, lines, isLineValid, outputCallback);
    },
    async ({ lines, outputCallback, screen, pause }) => {
        // const satisfied =
        //     parseLines(lines).filter(l => isLineReallyValid(l)[0]).length;
        // await outputCallback(satisfied);
        await runEntry(screen, pause, lines, isLineReallyValid, outputCallback);
    },
    { key: "password-philosophy", title: "Password Philosophy", stars: 2, suggestedDelay: 20}
);

async function runEntry(
    screen: ScreenBuilder | undefined, 
    pause: Pause, 
    lines: string[], 
    passwordChecker: PasswordChecker, 
    outputCallback: (outputLine: any, shouldClear?: boolean | undefined
) => Promise<void>) {
    const visualizer = await buildVisualizer(screen, pause);
    const passwordLines = parseLines(lines);
    await visualizer.setupPasswords(passwordLines.map(l => l.password));

    let satisfied = 0;
    for (let i = 0; i < passwordLines.length; i++) {
        const line = passwordLines[i];
        const [isValid, indexes] = passwordChecker(line);
        await visualizer.colorPassword(i, indexes, isValid);
        if (isValid) {
            satisfied++;
        }
    }
    await outputCallback(satisfied);
}
