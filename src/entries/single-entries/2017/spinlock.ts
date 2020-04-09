import { entryForFile } from "../../entry";

export const spinlock = entryForFile(
    async ({ lines, outputCallback }) => {
        const steps = parseInt(lines[0], 10);
        const buffer: number[] = [0];
        let currentPosition = 0;
        for (let i = 1; i <= 2017; i++) {
            currentPosition = (currentPosition + steps) % buffer.length + 1;
            buffer.splice(currentPosition, 0, i);
        }

        await outputCallback(buffer[(currentPosition + 1) % buffer.length]);

    },
    async ({ lines, outputCallback }) => {
        const steps = parseInt(lines[0], 10);
        // const buffer: number[] = [0];
        let lastAdd = 0;
        let currentPosition = 0;
        const total = 50 * 10**6;
        for (let i = 1; i <= total; i++) {
            currentPosition = (currentPosition + steps) % i + 1;
            if (currentPosition === 1) {
                lastAdd = i;
            }
            // buffer.splice(currentPosition, 0, i);
            // await outputCallback(buffer[1]);
        }

        // const zeroIndex = buffer.indexOf(0);

        // await outputCallback(buffer[(zeroIndex + 1) % buffer.length]);
        await outputCallback(lastAdd);
    },
    { key: "spinlock", title: "Spinlock", stars: 2, }
);