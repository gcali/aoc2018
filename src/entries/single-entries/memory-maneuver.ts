import { entryForFile } from "../entry";

class Node {
    public nodes: Node[] = [];
    public metadata: number[] = [];

    public value(): number {
        if (this.nodes.length === 0) {
            let sum = 0;
            this.metadata.forEach(m => sum += m);
            return sum;
        }
        else {
            let nodes = this.nodes;
            return this.metadata.map(m => {
                let index = m - 1;
                if (index >= 0 && nodes[index] !== undefined) {
                    let subValue = nodes[index].value();
                    return subValue;
                }
                else {
                    return 0;
                }
            }).reduce((acc, curr) => acc + curr, 0);
        }
    }
}

function getTree(tokens: string[], startIndex: number): [Node, number] {
    let numberOfChildren = parseInt(tokens[startIndex]);
    let numberOfMetadata = parseInt(tokens[startIndex + 1]);
    startIndex += 2;
    if (numberOfChildren === 0) {
        let metadata = tokens.slice(startIndex, startIndex + numberOfMetadata);
        let parsedMetadata = metadata.map(m => parseInt(m));
        if (parsedMetadata.some(isNaN)) {
            console.log(parsedMetadata);
        }
        let node = new Node();
        node.metadata = parsedMetadata;
        node.nodes = [];
        return [node, startIndex + numberOfMetadata];
    }
    else {
        let node = new Node();
        while (numberOfChildren > 0) {
            let [child, newStart] = getTree(tokens, startIndex);
            node.nodes.push(child);
            startIndex = newStart;
            numberOfChildren--;
        }
        let metadata = tokens.slice(startIndex, startIndex + numberOfMetadata).map(e => parseInt(e));
        if (metadata.some(isNaN)) {
            console.log(tokens.slice(startIndex, startIndex + numberOfMetadata));
        }
        node.metadata = metadata;
        return [node, startIndex + numberOfMetadata];
    }
}

const entry = entryForFile(
    lines => {
        let line = lines[0];
        let tokens = line.split(" ");

        let calcMetadataSum = (tree: Node): number => {
            let sum = 0;
            tree.nodes.forEach(node => {
                sum += calcMetadataSum(node);
            })
            tree.metadata.forEach(m => {
                sum += m;
            });
            return sum;
        }

        function printMetadata(tree: Node) {
            console.log(tree.metadata);
            tree.nodes.forEach(n => printMetadata(n));
        }

        let [tree, endIndex] = getTree(tokens, 0);
        printMetadata(tree);
        console.log("" + endIndex + " " + tokens.length);
        console.log(calcMetadataSum(tree))
    },
    lines => {
        let line = lines[0];
        let tokens = line.split(" ");
        let [tree, endIndex] = getTree(tokens, 0);
        console.log(tree.value());
    }
);

export default entry;