import Entry from '../entry';
import readLines from '../../support/file-reader';

const entry: Entry = {
    first: () => readLines((lines) => {
        interface WordCounter { [key: string]: number; }
        function createWordCounter(word: string) {
            const currentCount: WordCounter = {};
            word.split('').forEach((letter) => {
                if (letter in currentCount) {
                    currentCount[letter]++;
                } else {
                    currentCount[letter] = 1;
                }
            });
            return currentCount;
        }
        function hasNLetters(counter: WordCounter, n: number): boolean {
            for (const key in counter) {
                if (counter[key] === n) {
                    return true;
                }
            }
            return false;
        }

        interface WordStatus {
            hasTwoLetters: boolean;
            hasThreeLetters: boolean;
        }

        const checksumCounter: WordStatus[] = lines.map((line) => {
            const counter = createWordCounter(line);
            return {
                hasTwoLetters: hasNLetters(counter, 2),
                hasThreeLetters: hasNLetters(counter, 3),
            };
        });

        const amountOfTwoLetters = checksumCounter.filter((c) => c.hasTwoLetters).length;
        const amountOfThreeLetters = checksumCounter.filter((c) => c.hasThreeLetters).length;

        console.log('Checksum: ' + amountOfTwoLetters * amountOfThreeLetters);

    }),
    second: () => readLines((lines) => {
        const stringLength = lines[0].length;
        for (let i = 0; i < stringLength; i++) {
            const spliced = lines.map((l) => l.slice(0, i) + l.slice(i + 1, l.length));
            const duplicates = new Set<string>();
            const hasFoundDuplicate = spliced.some((l) => {
                if (duplicates.has(l)) {
                    console.log(l);
                    return true;
                } else {
                    duplicates.add(l);
                }
            });
            if (hasFoundDuplicate) {
                return;
            }
        }
        console.log('Something wen wrong');
    }),
};
export default entry;
