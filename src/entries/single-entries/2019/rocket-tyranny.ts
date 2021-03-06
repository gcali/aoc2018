import { entryForFile } from "../../entry";

const fuelCalculator = (mass: number) => Math.floor(mass / 3) - 2;
const intelligentFuelCalculator = (mass: number): number => {
    const requirement = Math.floor(mass / 3) - 2;
    if (requirement <= 0) {
        return 0;
    } else {
        return requirement + intelligentFuelCalculator(requirement);
    }
};

export const entry = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const requirement = lines
            .map((line) => parseInt(line, 10))
            .map(fuelCalculator)
            .reduce((acc, next) => acc + next, 0);

        await outputCallback(`Result: ${requirement}`);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const requirement = lines
            .map((line) => parseInt(line, 10))
            .map(intelligentFuelCalculator)
            .reduce((acc, next) => acc + next, 0);

        await outputCallback(`Result: ${requirement}`);
    },
    { key: "rocket-tyranny", title: "The Tyranny of the Rocket Equation", stars: 2, embeddedData: true}
);
