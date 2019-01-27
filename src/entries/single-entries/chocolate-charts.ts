import { entryForFile } from "../entry";

function moveElf(position: number, recipes: number[]) {
    return (position + 1 + recipes[position]) % recipes.length;
}

export const entry = entryForFile(
    async ({ lines, outputCallback }) => {
        const interestingRecipes = 10;
        const numberOfSteps = parseInt(lines[0], 10);
        const recipes = [3, 7];
        let currentFirst = 0;
        let currentSecond = 1;
        while (recipes.length < numberOfSteps + interestingRecipes) {
            const result = recipes[currentFirst] + recipes[currentSecond];
            if (result < 10) {
                recipes.push(result);
            } else {
                const first = Math.floor(result / 10);
                const second = result % 10;
                recipes.push(first);
                recipes.push(second);
            }
            currentFirst = moveElf(currentFirst, recipes);
            currentSecond = moveElf(currentSecond, recipes);
        }

        const output = [];
        for (let i = 0; i < interestingRecipes; i++) {
            output.push(recipes[numberOfSteps + i]);
        }

        await outputCallback(output.join(""));
    },
    async ({ lines, outputCallback, pause }) => {
        const targetPattern = lines[0].split("").map((e) => parseInt(e, 10));
        let memory: number[] = [];
        function checkIfSame(target: number[], nestedMemory: number[]) {
            if (target.length !== nestedMemory.length) {
                return false;
            }
            for (let i = 0; i < target.length; i++) {
                if (target[i] !== nestedMemory[i]) {
                    return false;
                }
            }
            return true;
        }
        function addMemory(nestedMemory: number[], target: number[], newElement: number): number[] {
            if (nestedMemory.length < target.length) {
                return nestedMemory.concat([newElement]);
            } else {
                return addMemory(nestedMemory.slice(1), target, newElement);
            }
        }

        const recipes = [3, 7];
        let currentFirst = 0;
        let currentSecond = 1;

        let iteration = 0;

        while (true) {
            if (++iteration % 10000 === 0) {
                await outputCallback("Iteration " + iteration + " done", true);
            }
            const result = recipes[currentFirst] + recipes[currentSecond];
            if (result < 10) {
                recipes.push(result);
                memory = addMemory(memory, targetPattern, result);
                if (checkIfSame(targetPattern, memory)) {
                    await outputCallback(recipes.length - targetPattern.length);
                    return;
                }
            } else {
                const first = Math.floor(result / 10);
                const second = result % 10;
                recipes.push(first);
                memory = addMemory(memory, targetPattern, first);
                if (checkIfSame(targetPattern, memory)) {
                    await outputCallback(recipes.length - targetPattern.length);
                    return;
                }
                recipes.push(second);
                memory = addMemory(memory, targetPattern, second);
                if (checkIfSame(targetPattern, memory)) {
                    await outputCallback(recipes.length - targetPattern.length);
                    return;
                }
            }
            currentFirst = moveElf(currentFirst, recipes);
            currentSecond = moveElf(currentSecond, recipes);
        }
    }
);
