import * as readline from "readline";
export default function frequency() {
    let readingInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let currentFrequency = 0;
    readingInterface.on('line', line => {
        let trimmed = line.trim();
        let value = parseInt(trimmed.slice(1));
        if (trimmed.startsWith("-")) {
            value *= -1;
        }
        currentFrequency += value;
    });
    readingInterface.on("close", () => {
        console.log("Result: " + currentFrequency);
    });
}