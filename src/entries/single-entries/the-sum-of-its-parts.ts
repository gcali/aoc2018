import { DefaultListDictionaryString } from "../../support/data-structure";
// import { log } from "@/support/log";
import { entryForFile } from "../entry";

class Graph {
    private nodes: { [key: string]: Node } = {};
    constructor(lines: string[]) {
        lines.forEach((line) => {
            const split = line.split(" ");
            const dependency = split[1];
            const nodeName = split[7];
            this.ensureNode(dependency);
            this.ensureNode(nodeName);

            this.nodes[nodeName].dependentFrom(this.nodes[dependency]);
        });
    }

    public isDone(): boolean {
        for (const key of Object.keys(this.nodes)) {
            const node = this.nodes[key];
            if (node.wip || !node.isDone) {
                return false;
            }
        }
        return true;

    }

    public getNextNode(): Node | null {
        const candidates = [];
        for (const key of Object.keys(this.nodes)) {
            const node = this.nodes[key];
            if (!node.isDone && !node.wip && !node.hasDependencies()) {
                candidates.push(node);
            }
        }
        if (candidates.length === 0) {
            return null;
        }
        const result = candidates.sort((a, b) => a.name.localeCompare(b.name))[0];
        result.wip = true;
        return result;
    }
    private ensureNode(name: string) {
        if (!(name in this.nodes)) {
            this.nodes[name] = new Node(name);
        }
    }
}
class Node {
    public dependencies: Node[] = [];
    public isDone: boolean = false;
    public wip: boolean = false;
    constructor(public name: string) {

    }

    public dependentFrom(other: Node) {
        this.dependencies.push(other);
    }

    public duration(): number {
        return this.name.toLowerCase().charCodeAt(0) - "a".charCodeAt(0) + 61;
    }

    public remove(): void {
        this.isDone = true;
    }

    public hasDependencies(): boolean {
        return this.dependencies.some((d) => !d.isDone);
    }
}
export const entry = entryForFile(
    (lines, outputCallback) => {
        const graph = new Graph(lines);
        const nodes = [];
        while (true) {
            const node = graph.getNextNode();
            if (node === null) {
                break;
            } else {
                node.isDone = true;
                nodes.push(node.name);
            }
        }
        outputCallback(nodes.join(""));
    },
    (lines, outputCallback) => {
        const graph = new Graph(lines);
        const howManyWorkers = 5;
        const workers = new Array<Node | null>(howManyWorkers);
        for (let i = 0; i < howManyWorkers; i++) {
            workers[i] = null;
        }
        const callbacks = new DefaultListDictionaryString<() => void>();
        let done = false;
        let currentSecond = 0;
        while (!done) {
            const call = callbacks.get("" + currentSecond);
            call.forEach((c) => c());
            callbacks.remove("" + currentSecond);
            if (graph.isDone()) {
                done = true;
            } else {
                for (let i = 0; i < howManyWorkers; i++) {
                    if (workers[i] === null) {
                        const nextNode = graph.getNextNode();
                        if (nextNode !== null) {
                            workers[i] = nextNode;
                            const workerIndex = i;
                            const targetTime = (currentSecond + nextNode.duration());
                            outputCallback("Adding to target " + targetTime + " node " + nextNode.name);
                            callbacks.add("" + targetTime, () => {
                                outputCallback("Node " + nextNode.name + " done");
                                nextNode.isDone = true;
                                nextNode.wip = false;
                                workers[workerIndex] = null;
                            });
                        }
                    }
                }
                currentSecond++;
            }
        }
        outputCallback(currentSecond);
    }
);
