import { entryForFile } from "../../entry";
import { Stack } from 'linq-typescript';

const parseLines = (lines: string[]): PipeDefinition[] => {
    return lines.map(line => {
        const [sourceToken, targetToken] = line.split(" <-> ");
        const source = parseInt(sourceToken, 10);
        const targets = targetToken.split(", ").map(e => parseInt(e, 10));
        return { source, targets };
    });
}; 

interface PipeDefinition {
    source: number;
    targets: number[];
}

class Graph {
    private readonly _map = new Map<number, Set<number>>();

    public addLink(source: number, target: number) {
        this.ensureLink(source, target);
        this.ensureLink(target, source);
    }

    public addDefinition(pipeDefinition: PipeDefinition) {
        pipeDefinition.targets.forEach(target => this.addLink(pipeDefinition.source, target));
    }

    public addDefinitions(pipeDefinitions: PipeDefinition[]) {
        pipeDefinitions.forEach(definition => this.addDefinition(definition));
    }

    getNodes(): number[] {
        return [...this._map.keys()];
    }

    public dfs(start: number, callback: (arg: number) => void) {
        const stack = new Stack<number>();
        const visited = new Set<number>();
        stack.push(start);
        while (true) {
            const toVisit = stack.pop();
            if (toVisit === undefined) {
                break;
            }
            if (visited.has(toVisit)) {
                continue;
            }
            visited.add(toVisit);
            callback(toVisit);
            const linked = this.getLinked(toVisit);
            linked.forEach(e => stack.push(e));
        }
    }

    private getLinked(source: number): number[] {
        const adjacency = this._map.get(source);
        if (!adjacency) {
            return [];
        }
        return [...adjacency.values()];
    }

    private ensureLink(source: number, target: number) {
        let adjacency = this._map.get(source);
        if (adjacency === undefined) {
            adjacency = new Set<number>();
            this._map.set(source, adjacency);
        }
        adjacency.add(target); 
    } 
}

export const digitalPlumber = entryForFile(
    async ({ lines, outputCallback }) => {
        const definitions = parseLines(lines);
        const graph = new Graph();
        graph.addDefinitions(definitions);
        let count = 0;
        graph.dfs(0, e => count++);
        await outputCallback(count);
    },
    async ({ lines, outputCallback }) => {
        const definitions = parseLines(lines);
        const graph = new Graph();
        graph.addDefinitions(definitions);
        const visited = new Set<number>();
        let count = 0;
        const stack = new Stack<number>(graph.getNodes());
        while (true) {
            const next = stack.pop();
            if (next === undefined) {
                break;
            } 
            if (visited.has(next)) {
                continue;
            }
            count++;
            graph.dfs(next, e => visited.add(e));
        }
        await outputCallback(count);
    },
    { key: "digital-plumber", title: "Digital Plumber", stars: 2, }
);  