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

const isLineValid = (passwordLine: PasswordLine): boolean => {
    const repetitions = passwordLine.password.split("").filter(e => e === passwordLine.letter).length;
    return repetitions <= passwordLine.maxRepetitions && repetitions >= passwordLine.minRepetitions;
}

const isLineReallyValid = (passwordLine: PasswordLine): boolean => {
    const targets = [passwordLine.minRepetitions, passwordLine.maxRepetitions]
        .map(e => e-1)
        .map(e => passwordLine.password[e]);
    const matching = targets.filter(e => e === passwordLine.letter).length;
    return matching === 1;
};

import { entryForFile } from "../../entry";

export const passwordPhilosophy = entryForFile(
    async ({ lines, outputCallback }) => {
        const satisfied =
            parseLines(lines).filter(isLineValid).length;
        await outputCallback(satisfied);
    },
    async ({ lines, outputCallback }) => {
        const satisfied =
            parseLines(lines).filter(isLineReallyValid).length;
        await outputCallback(satisfied);
    },
    { key: "password-philosophy", title: "Password Philosophy", stars: 2}
);