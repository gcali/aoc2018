import { entryForFile } from "../entry";
import { Tree } from '@/support/data-structure';

interface Planet {
    code: string;
    distance: number | null;
    orbiting: string | null;
}

type PlanetChain = Tree<Planet>;

interface Orbit {
    center: string;
    orbiting: string;
}

function parseLine(line: string): Orbit {
    const tokenized = line.trim().split(")");
    return {
        center: tokenized[0],
        orbiting: tokenized[1]
    };
}

type NodeMap = { [key: string]: Planet };

function fillDistance(nodeMap: NodeMap, code: string | null) {
    if (code == null) {
        return;
    }
    const node = nodeMap[code];
    if (node.distance !== null) {
        return;
    }
    const parentCode = node.orbiting;
    if (parentCode === null) {
        node.distance = 1;
        return;
    }
    const parentNode = nodeMap[parentCode];
    if (parentNode.distance !== null) {
        node.distance = parentNode.distance + 1;
        return;
    }
    fillDistance(nodeMap, parentCode);
    node.distance = parentNode.distance! + 1;
}

function getChain(start: string, nodeMap: NodeMap): string[] {
    let currentNode = nodeMap[start];
    const result: string[] = [];
    while (currentNode.orbiting !== null) {
        result.push(currentNode.orbiting);
        currentNode = nodeMap[currentNode.orbiting];
    }
    return result;
}

function getFirstIntersection(a: string[], b: string[]): string {
    const otherSet = new Set<string>(b);
    for (const planet of a) {
        if (otherSet.has(planet)) {
            return planet;
        }
    }
    throw new Error("Not intersection found!");
}

export const universalObritMap = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const nodes: NodeMap = {};

        const center = 'COM';
        nodes[center] = {
            code: center,
            distance: 0,
            orbiting: null
        };

        // const chain = new Tree<Planet>(nodes[center]);

        lines.forEach(line => {
            const orbit = parseLine(line);
            nodes[orbit.orbiting] = {
                code: orbit.orbiting,
                distance: null,
                orbiting: orbit.center
            };
        });
        Object.keys(nodes).forEach(n => fillDistance(nodes, n));

        const sum = Object.values(nodes).map(n => n.distance!).reduce((acc, next) => acc + next);
        await outputCallback(sum);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const nodes: NodeMap = {};

        const center = 'COM';
        nodes[center] = {
            code: center,
            distance: 0,
            orbiting: null
        };

        lines.forEach(line => {
            const orbit = parseLine(line);
            nodes[orbit.orbiting] = {
                code: orbit.orbiting,
                distance: null,
                orbiting: orbit.center
            };
        });


        const mine = 'YOU';
        const santa = 'SAN';

        const mineChain = getChain(mine, nodes);
        const santaChain = getChain(santa, nodes);

        const firstIntersection = getFirstIntersection(mineChain, santaChain);

        console.log(mineChain);
        console.log(santaChain);
        const result = mineChain.indexOf(firstIntersection) + santaChain.indexOf(firstIntersection);
        await outputCallback(result);

        // const mineChain = 
    }
);
