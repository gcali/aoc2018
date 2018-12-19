import { entryForFile } from "../entry";
import { Coordinate } from "../../support/geometry";
import { SimpleBest } from "../../support/best";
import { FixedSizeMatrix } from "../../support/matrix";

const entry = entryForFile(
    lines => {
        let points: Coordinate[] = lines.map(l => l.replace(/ /g, "").split(",")).map(couple => {
            return {
                x: parseInt(couple[0]),
                y: parseInt(couple[1])
            };
        });

        let minComparator = (a: number, b: number) => b - a;
        let maxComparator = (a: number, b: number) => a - b;

        let minX = new SimpleBest<number>(minComparator);
        let maxX = new SimpleBest<number>(maxComparator);
        let minY = new SimpleBest<number>(minComparator);
        let maxY = new SimpleBest<number>(maxComparator);

        points.forEach(p => {
            minX.add(p.x);
            maxX.add(p.x);
            minY.add(p.y);
            maxY.add(p.y);
        });

        let size = {
            x: maxX.currentBest - minX.currentBest + 1,
            y: maxY.currentBest - minY.currentBest + 1
        };

        points = points.map(p => {
            return {
                x: p.x - minX.currentBest,
                y: p.y - minY.currentBest
            };
        });

        let grid = new FixedSizeMatrix(size);

        points.forEach(p => grid.set(p, p));
    },
    lines => {
    }
);

export default entry;