import { entryForFile } from "../entry";
import { DefaultListDictionaryString } from "../../support/data-structure";

class Graph {
    private nodes: { [key: string]: Node } = {}
    constructor(lines: string[]) {
        lines.forEach(line => {
            let split = line.split(" ");
            let dependency = split[1];
            let nodeName = split[7];
            this.ensureNode(dependency);
            this.ensureNode(nodeName);

            this.nodes[nodeName].dependentFrom(this.nodes[dependency]);
        });
    }
    private ensureNode(name: string) {
        if (!(name in this.nodes)) {
            this.nodes[name] = new Node(name);
        }
    }

    public isDone(): boolean {
        for (let key in this.nodes) {
            let node = this.nodes[key];
            if (node.wip || !node.isDone) {
                return false;
            }
        }
        return true;

    }

    public getNextNode(): Node | null {
        let candidates = [];
        for (let key in this.nodes) {
            let node = this.nodes[key];
            if (!node.isDone && !node.wip && !node.hasDependencies()) {
                candidates.push(node);
            }
        }
        if (candidates.length === 0) {
            return null;
        }
        let result = candidates.sort((a, b) => a.name.localeCompare(b.name))[0];
        result.wip = true;
        return result;
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
        return this.dependencies.some(d => !d.isDone);
    }
}
const entry = entryForFile(
    lines => {
        let graph = new Graph(lines);
        let nodes = [];
        while (true) {
            let node = graph.getNextNode();
            if (node === null) {
                break;
            }
            else {
                node.isDone = true;
                nodes.push(node.name);
            }
        }
        console.log(nodes.join(""));
    },
    lines => {
        let graph = new Graph(lines);
        let howManyWorkers = 5;
        let workers = new Array<Node | null>(howManyWorkers);
        for (let i = 0; i < howManyWorkers; i++) {
            workers[i] = null;
        }
        let callbacks = new DefaultListDictionaryString<() => void>();
        let done = false;
        let currentSecond = 0;
        while (!done) {
            let call = callbacks.get("" + currentSecond);
            call.forEach(c => c());
            callbacks.remove("" + currentSecond);
            if (graph.isDone()) {
                done = true;
            }
            else {
                for (let i = 0; i < howManyWorkers; i++) {
                    if (workers[i] === null) {
                        let nextNode = graph.getNextNode();
                        if (nextNode !== null) {
                            workers[i] = nextNode;
                            let workerIndex = i;
                            let targetTime = (currentSecond + nextNode.duration());
                            console.log("Adding to target " + targetTime + " node " + nextNode.name);
                            callbacks.add("" + targetTime, () => {
                                console.log("Node " + nextNode.name + " done");
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
        console.log(currentSecond);
    }
);
export default entry;