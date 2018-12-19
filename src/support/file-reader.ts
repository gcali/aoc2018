import * as readline from "readline";

export default (callback: (lines: string[]) => void) => {
    let readingInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    let lines: string[] = [];
    readingInterface.on('line', line => {
        let trimmed = line.trim();
        lines.push(line);

    });
    readingInterface.on('close', () => callback(lines));
}