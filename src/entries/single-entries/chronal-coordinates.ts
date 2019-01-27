import { oldEntryForFile } from "../entry";
import { Coordinate, sumCoordinate } from "../../support/geometry";
import Best, { SimpleBest, CustomBest, maxNumber } from "../../support/best";
import { FixedSizeMatrix } from "../../support/matrix";
import { Queue } from "../../support/data-structure";
// import { log } from "@/support/log";

interface Territory {
  coordinate: Coordinate;
  id: number | null;
  distance: number;
}

export const entry = oldEntryForFile(
  async (lines, outputCallback) => {
    let points: Coordinate[] = parsePoints(lines);

    const { minX, minY, size } = getBoundaries(points);

    points = points.map((p) => {
      return {
        x: p.x - minX.currentBest!,
        y: p.y - minY.currentBest!,
      };
    });

    const grid = new FixedSizeMatrix<Territory>(size);

    const queue = new Queue<Territory>();
    const territoryPoints = points.map((p, index) => {
      return {
        coordinate: p,
        distance: 0,
        id: index + 1,
      };
    });
    territoryPoints.forEach((p) => {
      grid.set(p.coordinate, p);
      queue.add(p);
    });

    const offsets = (() => {
      const numberOffsets = [1, 0, -1];
      return numberOffsets.map((i) => numberOffsets.map((j) => i === j || (i !== 0 && j !== 0) ? null : {
        x: i,
        y: j,
      }).filter((l) => l)).reduce((acc, curr) => acc.concat(curr));
    })();
    if (offsets.length !== 4) {
      throw Error("What happened to the offsets?");
    }

    while (!queue.isEmpty) {
      const nextElement = queue.get();
      if (nextElement) {
        offsets.forEach((offset) => {
          const newCoordinate = sumCoordinate(nextElement.coordinate, offset!);
          if (newCoordinate.x >= 0 && newCoordinate.y >= 0
            && newCoordinate.x < size.x && newCoordinate.y < size.y) {

            const newDistance = nextElement.distance + 1;
            const gridStatus = grid.get(newCoordinate);
            if (!gridStatus) {
              const newElement = {
                coordinate: newCoordinate,
                distance: newDistance,
                id: nextElement.id,
              };
              grid.set(newCoordinate, newElement);
              queue.add(newElement);
            } else if (gridStatus.distance === newDistance && gridStatus.id !== nextElement.id) {
              const newElement: Territory = {
                id: null,
                coordinate: newCoordinate,
                distance: newDistance,
              };
              grid.set(newCoordinate, newElement);
              queue.add(newElement);
            }
          }
        });
      }
    }


    // imgCreator(0, grid);
    const currentCount: { [key: number]: number } = {};
    for (let i = 0; i < size.x; i++) {
      for (let j = 0; j < size.y; j++) {
        const status = grid.get({
          x: i,
          y: j,
        });
        if (status === undefined) {
          await outputCallback("" + i + " " + j);
        } else if (!status.id) {
          continue;
        } else if (status.coordinate.x === 0 || status.coordinate.y === 0
          || status.coordinate.x === size.x - 1 || status.coordinate.y === size.y - 1) {
          currentCount[status.id] = 0;
        } else {
          if (!(status.id in currentCount)) {
            currentCount[status.id] = 1;
          } else if (currentCount[status.id] !== 0) {
            currentCount[status.id]++;
          }
        }
      }
    }

    const bestArea = new SimpleBest<number>(maxNumber);
    for (const key of Object.keys(currentCount)) {
      bestArea.add(currentCount[parseInt(key, 10)]);
    }
    await outputCallback(bestArea.currentBest);



  },
  async (lines, outputCallback) => {
    function manhattan(a: Coordinate, b: Coordinate) {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    const points = parsePoints(lines);
    const { minX, minY, size } = getBoundaries(points);
    const maxDistance = 10000;
    let count = 0;
    for (let i = 0; i < size.x; i++) {
      for (let j = 0; j < size.y; j++) {
        const distanceSum = points.map((p) => manhattan(p, {
          x: i + minX.currentBest!,
          y: j + minY.currentBest!,
        })).reduce((acc, curr) => acc + curr);
        if (distanceSum < maxDistance) {
          count++;
        }
      }
    }
    await outputCallback(count);
  },
);

function getBoundaries(points: Coordinate[]) {
  const minComparator = (a: number, b: number) => b - a;
  const maxComparator = (a: number, b: number) => a - b;
  const minX = new SimpleBest<number>(minComparator);
  const maxX = new SimpleBest<number>(maxComparator);
  const minY = new SimpleBest<number>(minComparator);
  const maxY = new SimpleBest<number>(maxComparator);
  points.forEach((p) => {
    minX.add(p.x);
    maxX.add(p.x);
    minY.add(p.y);
    maxY.add(p.y);
  });
  const size = {
    x: (maxX.currentBest! - minX.currentBest! + 1),
    y: (maxY.currentBest! - minY.currentBest! + 1),
  };
  return { minX, minY, size };
}

function parsePoints(lines: string[]): Coordinate[] {
  return lines.map((l) => l.replace(/ /g, "").split(",")).map((couple) => {
    return {
      x: parseInt(couple[0], 10),
      y: parseInt(couple[1], 10),
    };
  });
}
