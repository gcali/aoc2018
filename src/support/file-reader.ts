import * as readline from 'readline';

export default (callback: (lines: string[]) => void) => {
    const readingInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    const lines: string[] = [];
    readingInterface.on('line', (line) => {
        const trimmed = line.trim();
        lines.push(line);

    });
    readingInterface.on('close', () => callback(lines));
};
