import * as readline from "readline";

export function readStdin(callback: (lines: string[]) => Promise<void>) {
    const i = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    const lines: string[] = [];
    i.on("line", (line: string) => {
        lines.push(line);
    });
    const promise = new Promise<void>((resolve) => {
        i.on("close", () => {
            callback(lines).then((value) => resolve());
        });
    });
}

