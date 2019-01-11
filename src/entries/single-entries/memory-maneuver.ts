import { oldEntryForFile } from "../entry";
// import { log } from "@/support/log";

class Node {
    public nodes: Node[] = [];
    public metadata: number[] = [];

    public value(): number {
        if (this.nodes.length === 0) {
            let sum = 0;
            this.metadata.forEach((m) => sum += m);
            return sum;
        } else {
            const nodes = this.nodes;
            return this.metadata.map((m) => {
                const index = m - 1;
                if (index >= 0 && nodes[index] !== undefined) {
                    const subValue = nodes[index].value();
                    return subValue;
                } else {
                    return 0;
                }
            }).reduce((acc, curr) => acc + curr, 0);
        }
    }
}

function getTree(tokens: string[], startIndex: number, outputCallback: (s: any) => void): [Node, number] {
    let numberOfChildren = parseInt(tokens[startIndex], 10);
    const numberOfMetadata = parseInt(tokens[startIndex + 1], 10);
    startIndex += 2;
    if (numberOfChildren === 0) {
        const metadata = tokens.slice(startIndex, startIndex + numberOfMetadata);
        const parsedMetadata = metadata.map((m) => parseInt(m, 10));
        if (parsedMetadata.some(isNaN)) {
            outputCallback(parsedMetadata);
        }
        const node = new Node();
        node.metadata = parsedMetadata;
        node.nodes = [];
        return [node, startIndex + numberOfMetadata];
    } else {
        const node = new Node();
        while (numberOfChildren > 0) {
            const [child, newStart] = getTree(tokens, startIndex, outputCallback);
            node.nodes.push(child);
            startIndex = newStart;
            numberOfChildren--;
        }
        const metadata = tokens.slice(startIndex, startIndex + numberOfMetadata).map((e) => parseInt(e, 10));
        if (metadata.some(isNaN)) {
            outputCallback(tokens.slice(startIndex, startIndex + numberOfMetadata));
        }
        node.metadata = metadata;
        return [node, startIndex + numberOfMetadata];
    }
}

export const entry = oldEntryForFile(
    async (lines, outputCallback) => {
        const line = lines[0];
        const tokens = line.split(" ");

        const calcMetadataSum = (argTree: Node): number => {
            let sum = 0;
            argTree.nodes.forEach((node) => {
                sum += calcMetadataSum(node);
            });
            argTree.metadata.forEach((m) => {
                sum += m;
            });
            return sum;
        };

        function printMetadata(argTree: Node) {
            outputCallback(argTree.metadata);
            argTree.nodes.forEach((n) => printMetadata(n));
        }

        const [tree, endIndex] = getTree(tokens, 0, outputCallback);
        printMetadata(tree);
        outputCallback("" + endIndex + " " + tokens.length);
        outputCallback(calcMetadataSum(tree));
    },
    async (lines, outputCallback) => {
        const line = lines[0];
        const tokens = line.split(" ");
        const [tree, endIndex] = getTree(tokens, 0, outputCallback);
        outputCallback(tree.value());
    },
);
