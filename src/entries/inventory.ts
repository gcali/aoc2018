import Entry from "./entry";
import readLines from "../support/file-reader";

const entry: Entry = {
    first: () => readLines(lines => {
        type WordCounter = { [key: string]: number };
        function createWordCounter(word: string) {
            let currentCount: WordCounter = {};
            word.split("").forEach(letter => {
                if (letter in currentCount) {
                    currentCount[letter]++;
                }
                else {
                    currentCount[letter] = 1;
                }
            });
            return currentCount;
        }
        function hasNLetters(counter: WordCounter, n: number): boolean {
            for (let key in counter) {
                if (counter[key] === n) {
                    return true;
                }
            }
            return false;
        }

        interface WordStatus {
            hasTwoLetters: boolean,
            hasThreeLetters: boolean
        }

        let checksumCounter: WordStatus[] = lines.map(line => {
            let counter = createWordCounter(line);
            return {
                hasTwoLetters: hasNLetters(counter, 2),
                hasThreeLetters: hasNLetters(counter, 3)
            };
        });

        let amountOfTwoLetters = checksumCounter.filter(c => c.hasTwoLetters).length;
        let amountOfThreeLetters = checksumCounter.filter(c => c.hasThreeLetters).length;

        console.log("Checksum: " + amountOfTwoLetters * amountOfThreeLetters);

    }),
    second: () => readLines(lines => {
        let stringLength = lines[0].length;
        for (let i = 0; i < stringLength; i++) {
            let spliced = lines.map(l => l.slice(0, i) + l.slice(i + 1, l.length));
            let duplicates = new Set<string>();
            let hasFoundDuplicate = spliced.some(l => {
                if (duplicates.has(l)) {
                    console.log(l);
                    return true;
                }
                else {
                    duplicates.add(l);
                }
            });
            if (hasFoundDuplicate) {
                return;
            }
        }
        console.log("Something wen wrong");
    })
};
export default entry;