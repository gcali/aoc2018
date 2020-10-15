import { Md5 } from 'ts-md5';
import { entryForFile } from "../../entry";

const getCharacter = (input: string, n: number): string | null => {
    const hash = Md5.hashAsciiStr(input + n);
    if (hash.slice(0,5) === "00000") {
        return hash[5].toString();
    } else {
        return null;
    }
}

export const howAboutANiceGameOfChess = entryForFile(
    async ({ lines, outputCallback }) => {
        const input = lines[0].trim();
        const password: (string | null)[] = [null,null,null,null,null,null,null,null];
        let i = 0;
        while (password.length !== password.filter(e => e !== null).length) {
            const c = getCharacter(input, i++);
            if (c !== null) {
                const index = password.indexOf(null);
                password[index] = c;
                await outputCallback(null);
                await outputCallback(password.map(e => e !== null ? e : "_").join(" "));
            }
        }
        await outputCallback("Decoded");
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "how-about-a-nice-game-of-chess", title: "How About a Nice Game of Chess?"}
);