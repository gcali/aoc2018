import { Md5 } from "ts-md5";
import { randomCharacter } from "../../../support/random";
import { entryForFile } from "../../entry";

const getCharacter = (input: string, n: number): string | null => {
    const hash = getHashIfRelevant(input, n);
    if (hash !== null) {
        return hash[5].toString();
    } else {
        return null;
    }
};

const getCharacterAndPosition = (input: string, n: number): {c: string, index: number} | null => {
    const hash = getHashIfRelevant(input, n);
    if (hash !== null) {
        const i = parseInt(hash[5], 10);
        if (i.toString() === hash[5]) {
            return {c: hash[6], index: i};
        }
    }
    return null;
};



const getHashIfRelevant = (input: string, n: number): string | null => {
    const hash = Md5.hashAsciiStr(input + n);
    if (hash.slice(0, 5) === "00000") {
        return hash as string;
    } else {
        return null;
    }
};

const fillPasswordWithRandom = (password: Array<string|null>): string => {
    return password.map((e) => e !== null ? e : randomCharacter()).join(" ");
};

export const howAboutANiceGameOfChess = entryForFile(
    async ({ lines, outputCallback }) => {

        const input = lines[0].trim();
        const password: Array<string | null> = [null, null, null, null, null, null, null, null];
        let i = 0;
        let lastTime = new Date().getTime();
        while (password.length !== password.filter((e) => e !== null).length) {
            const c = getCharacter(input, i++);
            if (c !== null) {
                const index = password.indexOf(null);
                password[index] = c;
                await outputCallback(null);
                await outputCallback(fillPasswordWithRandom(password));
            } else {
                const current = new Date().getTime();
                if (current - lastTime > 100) {
                    lastTime = current;
                    await outputCallback(null);
                    await outputCallback(fillPasswordWithRandom(password));
                }
            }
        }
        await outputCallback("Decoded");
        await outputCallback(password.join(""));
    },
    async ({ lines, outputCallback }) => {
        const input = lines[0].trim();
        const password: Array<string | null> = [null, null, null, null, null, null, null, null];
        let i = 0;
        let lastTime = new Date().getTime();
        while (password.length !== password.filter((e) => e !== null).length) {
            const c = getCharacterAndPosition(input, i++);
            if (c !== null) {
                const index = c.index;
                if (index >= 0 && index < password.length && password[index] === null) {
                    password[index] = c.c;
                    await outputCallback(null);
                    await outputCallback(fillPasswordWithRandom(password));
                }
            } else {
                const current = new Date().getTime();
                if (current - lastTime > 100) {
                    lastTime = current;
                    await outputCallback(null);
                    await outputCallback(fillPasswordWithRandom(password));
                }
            }
        }
        await outputCallback("Decoded");
        await outputCallback(password.join(""));
    },
    { key: "how-about-a-nice-game-of-chess", title: "How About a Nice Game of Chess?", stars: 2}
);
