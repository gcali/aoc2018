import { entryForFile } from "../../entry";
import { groupBy } from "../../../support/sequences";
import { calculateKnotHash } from "./knot-hash";
import { FixedSizeMatrix } from "../../../support/matrix";
import { Coordinate, getSurrounding } from "../../../support/geometry";
import { NotImplementedError } from "../../../support/error";
import { Stack } from "linq-typescript";

type Binary = 0 | 1;

type Disk = Binary[][];

const hexStringToBits = (s: string): Binary[] => {
    return [...s]
        .map((e) => parseInt(e, 16))
        .map((e) => e.toString(2).padStart(4, "0"))
        .flatMap((e) => e.split(""))
        .map((e) => parseInt(e, 10) as Binary);
};

export const diskDefragmentation = entryForFile(
    async ({ lines, outputCallback }) => {
        const key = lines[0].trim();
        const bits = generateDisk(key);
        await outputCallback(bits.map((row) => row.join("")).join("\n"));
        const setBitsCount = bits.flatMap((e) => e).filter((e) => e === 1).length;
        await outputCallback(setBitsCount);
    },
    async ({ lines, outputCallback }) => {
        const key = lines[0].trim();
        const disk = generateDisk(key);
        const diskMatrix = new FixedSizeMatrix<Binary>({x: 128, y: 128});
        diskMatrix.setFlatData(disk.flat());
        let regionCount = 0;
        diskMatrix.onEveryCell((coordinate, value) => {
            if (value === 1) {
                regionCount++;
                emptyRegion(diskMatrix, coordinate);
            }
        });
        await outputCallback(regionCount);
    },
    { key: "disk-defragmentation", title: "Disk Defragmentation", stars: 2, }
);

function emptyRegion(matrix: FixedSizeMatrix<Binary>, coordinate: Coordinate) {
    const stack = new Stack<Coordinate>();
    stack.push(coordinate);
    while (true) {
        const nextCoordinate = stack.pop();
        if (nextCoordinate === undefined) {
            break;
        }
        matrix.set(nextCoordinate, 0);
        getSurrounding(nextCoordinate).filter((e) => matrix.get(e) === 1).forEach((e) => stack.push(e));
    }
}

function generateDisk(key: string): Disk {
    const generatedLines = [...Array(128).keys()].map((index) => `${key}-${index}`);
    const hashes = generatedLines.map((e) => calculateKnotHash(e));
    const bits = hashes.map(hexStringToBits);
    return bits;
}
