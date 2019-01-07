import * as readline from "readline";

export function readStdin(callback: (lines: string[]) => void) {
    const i = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    const lines: string[] = [];
    i.on("line", (line) => {
        lines.push(line);
    });
    i.on("close", () => {
        callback(lines);
    });
}

