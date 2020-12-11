import { entryForFile } from "../../entry";

function isValidPassword(n: number, maxRepeating: number): boolean {
    const stringed = n.toString();
    let hasSame = false;
    let repeating = 0;
    for (let i = 0; i < stringed.length - 1; i++) {
        if (stringed[i] === stringed[i + 1]) {
            hasSame = true;
            if (repeating === 0) {
                repeating = 2;
            } else {
                repeating++;
            }
            if (repeating > maxRepeating) {
                hasSame = false;
            }
        } else {
            if (hasSame) {
                break;
            }
            repeating = 0;
        }
    }
    if (!hasSame) {
        return false;
    }

    let prev = n % 10;
    n = Math.floor(n / 10);
    while (n > 0) {
        const next = n % 10;
        if (prev < next) {
            return false;
        }
        prev = next;
        n = Math.floor(n / 10);
    }
    return true;
}

export const secureContainer = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        await calculate(lines, 6, outputCallback);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        await calculate(lines, 2, outputCallback);
    },
    { key: "secure-container", title: "Secure Container", stars: 2, embeddedData: true}
);

async function calculate(
    lines: string[],
    maxRepeating: number,
    outputCallback: (outputLine: any, shouldClear?: boolean | undefined) => Promise<void>
) {
    const min = parseInt(lines[0], 10);
    const max = parseInt(lines[1], 10);
    let current = min;
    let count = 0;
    while (current <= max) {
        if (isValidPassword(current, maxRepeating)) {
            count++;
        }
        current++;
    }
    await outputCallback(`Result: ${count}`);
}
