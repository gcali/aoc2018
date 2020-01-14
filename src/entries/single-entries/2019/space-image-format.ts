import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from "../../../support/matrix";
import wu from "wu";
import { forEachAsync } from "../../../support/async";

export const spaceImageFormat = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const width = 25;
        const height = 6;
        const input = lines[0].split("").map((e) => parseInt(e, 10));
        const inputSize = input.length;
        const layerSize = width * height;
        const layers: Array<FixedSizeMatrix<number>> = [];
        for (let i = 0; i < inputSize; i += layerSize) {
            const newLayer = new FixedSizeMatrix<number>({ x: width, y: height });
            newLayer.setFlatData(input.slice(i, i + layerSize));
            layers.push(newLayer);
        }

        const smallestLayer = layers.map((layer) => ({
            zeros: layer.data.filter((e) => e === 0).length,
            data: layer.data
        })).sort((a, b) => a.zeros - b.zeros)[0].data;
        const ones = smallestLayer.filter((e) => e === 1).length;
        const twos = smallestLayer.filter((e) => e === 2).length;
        await outputCallback(ones * twos);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const width = 25;
        const height = 6;
        const input = lines[0].split("").map((e) => parseInt(e, 10));
        const inputSize = input.length;
        const layerSize = width * height;
        const layers: Array<FixedSizeMatrix<number>> = [];
        for (let i = 0; i < inputSize; i += layerSize) {
            const newLayer = new FixedSizeMatrix<number>({ x: width, y: height });
            newLayer.setFlatData(input.slice(i, i + layerSize));
            layers.push(newLayer);
        }

        const result = new FixedSizeMatrix<number>({ x: width, y: height });
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let currentLayer = 0;
                while (layers[currentLayer].get({ x, y }) === 2) {
                    currentLayer++;
                }
                result.set({ x, y }, layers[currentLayer].get({ x, y })!);
            }
        }

        const output = wu(result.overRows())
            .map((row) => row.map((e) => e === 0 ? " " : "X").join(""))
            .toArray();

        await forEachAsync(output, async (row) => await outputCallback(row));
    }
);

