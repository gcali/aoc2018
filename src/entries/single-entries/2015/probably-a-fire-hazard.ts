import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from "../../../support/matrix";

export const probablyAFireHazard = entryForFile(
    async ({ lines, outputCallback }) => {
        const field = new FixedSizeMatrix<boolean>({x: 1000, y: 1000});
        lines.forEach((line) => {
            let delta: number | null = null;
            let mapper: ((original: boolean) => boolean) | null = null;
            if (line.startsWith("turn on")) {
                delta = 2;
                mapper = ((_) => true);
            } else if (line.startsWith("toggle")) {
                delta = 1;
                mapper = ((x) => !x);
            } else if (line.startsWith("turn off")) {
                delta = 2;
                mapper = ((_) => false);
            } else {
                throw new Error("Unexpected line");
            }
            const tokens = line.split(" ");
            const [top, left] = tokens[delta].split(",").map((e) => parseInt(e, 10));
            const [bottom, right] = tokens[delta + 2].split(",").map((e) => parseInt(e, 10));
            for (let x = left; x <= right; x++) {
                for (let y = top; y <= bottom; y++) {
                    field.set({x, y}, mapper(field.get({x, y}) || false));
                }
            }
        });
        const count = field.reduce((acc, next) => acc + (next.cell ? 1 : 0), 0);
        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        const field = new FixedSizeMatrix<number>({x: 1000, y: 1000});
        field.fill(0);
        lines.forEach((line) => {
            let delta: number | null = null;
            let mapper: ((original: number) => number) | null = null;
            if (line.startsWith("turn on")) {
                delta = 2;
                mapper = ((n) => n + 1);
            } else if (line.startsWith("toggle")) {
                delta = 1;
                mapper = ((n) => n + 2);
            } else if (line.startsWith("turn off")) {
                delta = 2;
                mapper = ((n) => Math.max(n - 1, 0));
            } else {
                throw new Error("Unexpected line");
            }
            const tokens = line.split(" ");
            const [top, left] = tokens[delta].split(",").map((e) => parseInt(e, 10));
            const [bottom, right] = tokens[delta + 2].split(",").map((e) => parseInt(e, 10));
            for (let x = left; x <= right; x++) {
                for (let y = top; y <= bottom; y++) {
                    field.set({x, y}, mapper(field.get({x, y}) || 0));
                }
            }
        });
        const count = field.reduce((acc, next) => acc + (next.cell || 0), 0);
        await outputCallback(count);
    },
    { key: "probably-a-fire-hazard", title: "Probably a Fire Hazard", stars: 2}
);
