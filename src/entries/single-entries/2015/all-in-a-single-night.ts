import { entryForFile } from "../../entry";
import Graph from "node-dijkstra";
import { permutationGenerator, buildGroups } from "../../../support/sequences";

export const allInASingleNight = entryForFile(
    async ({ lines, outputCallback }) => {
        const edges = lines.map((line) => {
            const [left, distance] = line.split(" = ");
            const places = left.split(" to ");
            return {
                places,
                distance: parseInt(distance, 10)
            };
        });

        const nodes = [...new Set<string>(edges.flatMap((e) => e.places))];

        let bestResult: null | number = null;
        for (const path of permutationGenerator(nodes)) {
            let cost = 0;
            for (const step of buildGroups(path, 2)) {
                const stepCost = edges.filter((edge) =>
                    edge.places.includes(step[0]) && edge.places.includes(step[1])
                )[0].distance;
                cost += stepCost;
            }
            if (bestResult === null || cost < bestResult) {
                bestResult = cost;
            }
        }

        await outputCallback(bestResult);
    },
    async ({ lines, outputCallback }) => {
        const edges = lines.map((line) => {
            const [left, distance] = line.split(" = ");
            const places = left.split(" to ");
            return {
                places,
                distance: parseInt(distance, 10)
            };
        });

        const nodes = [...new Set<string>(edges.flatMap((e) => e.places))];

        let bestResult: null | number = null;
        for (const path of permutationGenerator(nodes)) {
            let cost = 0;
            for (const step of buildGroups(path, 2)) {
                const stepCost = edges.filter(
                    (edge) => edge.places.includes(step[0]) && edge.places.includes(step[1])
                )[0].distance;
                cost += stepCost;
            }
            if (bestResult === null || cost > bestResult) {
                bestResult = cost;
            }
        }

        await outputCallback(bestResult);
    },
    { key: "all-in-a-single-night", title: "All in a Single Night", stars: 2 }
);
