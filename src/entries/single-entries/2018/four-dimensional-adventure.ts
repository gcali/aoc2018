import { entryForFile } from "../../entry";
import { Stack } from 'linq-typescript';
import wu from 'wu';

interface Coordinate {
    x: number;
    y: number;
    z: number;
    t: number;
}

const manhattanDistance = (a: Coordinate, b: Coordinate) => [
    (e: Coordinate) => e.x,
    (e: Coordinate) => e.y,
    (e: Coordinate) => e.z,
    (e: Coordinate) => e.t
].map(e => Math.abs(e(a) - e(b))).reduce((acc, next) => acc + next);

const parseLines = (lines: string[]): Coordinate[] => {
    return lines.map(deserializeNode);
};

const deserializeNode = (line: string): Coordinate => {
        const [x,y,z,t] = line.trim().split(",").map(e => parseInt(e,10));
        return { x,y,z,t };
};

class Graph {
    private readonly nodeMap: Map<string, Set<string>> = new Map<string, Set<string>>();

    private serializeNode(node: Coordinate): string {
        return `${node.x},${node.y},${node.z},${node.t}`;
    }

    private deserializeNode(line: string): Coordinate {
        return deserializeNode(line);
    }

    public addNode(node: Coordinate): void {
        const key = this.serializeNode(node);
        if (!this.nodeMap.has(key)) {
            this.nodeMap.set(key, new Set<string>());
        }
    }

    public addEdge(a: Coordinate, b: Coordinate): void {
        this.addDirectEdge(a, b);
        this.addDirectEdge(b, a);
    }

    public visit(a: Coordinate | string): Coordinate[] {
        if (typeof a === "string") {
            a = this.deserializeNode(a);
        }
        const visited = new Set<string>();
        const toVisit = new Stack<string>();
        toVisit.push(this.serializeNode(a));
        while (true) {
            const next = toVisit.pop();
            if (next === undefined) {
                break;
            }
            if (visited.has(next)) {
                continue;
            }
            visited.add(next);
            const neighbours = this.nodeMap.get(next) || new Set<string>();
            neighbours.forEach(neighbour => {
                if (!visited.has(neighbour)) {
                    toVisit.push(neighbour);
                }
            });
        }
        return wu(visited.values()).map(e => this.deserializeNode(e)).toArray();
    }

    public findConstellations(): Coordinate[][] {
        const allNodes = [...this.nodeMap.keys()];
        const toVisit = new Stack<string>(allNodes);
        const visited = new Set<string>();
        const constellations: Coordinate[][] = [];
        while (true) {
            const next = toVisit.pop();
            if (next === undefined) {
                break;
            }
            if (visited.has(next)) {
                continue;
            }
            const constellation = this.visit(next);
            constellation.forEach(e => visited.add(this.serializeNode(e)));
            constellations.push(constellation);
        }
        return constellations;
    }

    private getNodeList(a: Coordinate): Set<string> {
        return this.nodeMap.get(this.serializeNode(a))!;
    }

    private addDirectEdge(a: Coordinate, b: Coordinate): void {
        this.addNode(a);
        const nodeList = this.getNodeList(a);
        nodeList.add(this.serializeNode(b));
    }
}

export const fourDimensionalAdventure = entryForFile(
    async ({ lines, outputCallback }) => {
        const points = parseLines(lines);

        const graph = new Graph();
        for (let outer = 0; outer < points.length; outer++) {
            graph.addNode(points[outer]);
            for (let inner = outer + 1; inner < points.length; inner++) {
                if (manhattanDistance(points[outer],points[inner]) <= 3) {
                    graph.addEdge(points[outer], points[inner]);
                }
            }
        } 

        const constellations = graph.findConstellations();
        await outputCallback(constellations.length);
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    },
    { key: "four-dimensional-adventure", title: "Four-Dimensional Adventure", stars: 2, }
);