import * as readline from "readline";

function handleLines(read: (value: number) => boolean, close: () => void) {
    let readingInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    readingInterface.on('line', line => {
        let trimmed = line.trim();
        let value = parseInt(trimmed.slice(1));
        if (trimmed.startsWith("-")) {
            value *= -1;
        }
        let shouldClose = read(value);
        if (shouldClose) {
            readingInterface.close();
        }

    });
    readingInterface.on('close', close);
}
export default {
    first: () => {

        let currentFrequency = 0;
        handleLines(value => {
            currentFrequency += value;
            return false;
        }, () => {
            console.log("Result: " + currentFrequency);
        });
    },
    second: () => {
        let values: number[] = [];
        let firstRoundOfFrequencies: number[] = [];
        let currentFrequency: number = 0;
        let repeatedFrequency: number = undefined;

        let shouldBrute = true;

        let readValues: number[] = [];
        let handleNextValue = (value: number) => {
            values.push(value);
            currentFrequency += value;
            firstRoundOfFrequencies.push(currentFrequency);
            return false;
        };
        handleLines(handleNextValue, () => {
            let foundFrequencies = new Set<number>();
            if (shouldBrute) {
                let current = 0;
                foundFrequencies.add(0);
                let found = false;
                while (!found) {
                    found = values.some(v => {
                        current += v;
                        if (foundFrequencies.has(current)) {
                            console.log("found: " + current);
                            return true;
                        }
                        else {
                            foundFrequencies.add(current);
                            return false;
                        }
                    });
                }
            }
            else {

                let inHowManySteps: { [key: number]: number[] } = {};
                let stepper = firstRoundOfFrequencies[firstRoundOfFrequencies.length - 1];
                for (let i = 0; i < firstRoundOfFrequencies.length - 1; i++) {
                    for (let j = i + 1; j < firstRoundOfFrequencies.length - 1; j++) {
                        let diff = Math.abs(firstRoundOfFrequencies[i] - firstRoundOfFrequencies[j]);
                        if (diff % stepper === 0) {
                            inHowManySteps[diff / stepper] = [i, j, firstRoundOfFrequencies[i], firstRoundOfFrequencies[j]];
                        }
                    }
                }
                console.log(inHowManySteps);
                return;
                let howManyRepeats = 1;
                // console.log(foundFrequencies);
                // return;
                while (!repeatedFrequency) {
                    console.log("Repeat " + howManyRepeats++);
                    readValues.some(handleNextValue);
                }
                console.log("First repeated: " + repeatedFrequency);
            }
        });
    }
};