import { entryForFile } from "../../entry";

export const iWasToldThereWouldBeNoMath = entryForFile(
    async ({ lines, outputCallback }) => {
        const sizes = lines.map(line => {
            return line.split("x").map(e => parseInt(e, 10));
        })
        .map(size => ({
            areas: [
                size[0] * size[1],
                size[0] * size[2],
                size[1] * size[2]
            ]
        }))
        .map(areas => ({
                minArea: areas.areas.reduce((acc, next) => Math.min(acc, next)),
                totalArea: areas.areas.reduce((acc, next) => acc + next) * 2
        }))
        .reduce((acc, next) => acc + (next.minArea + next.totalArea), 0);

        await outputCallback(sizes);
    },
    async ({ lines, outputCallback }) => {
        const sizes = lines.map(line => {
            return line.split("x").map(e => parseInt(e, 10));
        })
        .map(size => {
            var biggest = size.reduce((acc, next) => Math.max(acc, next));
            var smallestPerimeter = (size.reduce((acc, next) => acc + next) - biggest) * 2;
            var volume = size.reduce((acc, next) => acc * next);
            return {
                smallestPerimeter,
                volume
            };
        })
        .map(a => a.smallestPerimeter + a.volume)
        .reduce((acc, next) => acc + next);

        await outputCallback(sizes);

    },
    { 
        key: "i-was-told-there-would-be-no-math", 
        title: "I Was Told There Would Be No Math",
        stars: 2
    }
);