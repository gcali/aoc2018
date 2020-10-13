import { entryForFile } from "../../entry";
import { Tree, Queue } from "../../../support/data-structure";

const parseLines = (lines: string[]): Map<string, DiscDefinition> => {
    const definitions = lines.map((line: string): DiscDefinition => {
        const split = line.split(" -> ");
        const [head, weightToParse] = split[0].split(" ");
        const weight = parseInt(weightToParse.slice(1, weightToParse.length - 1), 10);

        const children = split.length === 1 ? [] : split[1].split(", ");

        return {
            head: {
                name: head,
                weight
            },
            children
        };
    });
    const map = new Map<string, DiscDefinition>();
    definitions.forEach((definition) => map.set(definition.head.name, definition));
    return map;
};

const buildTree = (
    startTree: string,
    definitions: Map<string, DiscDefinition>,
): Tree<WeightedProgram> => {
    const definition = definitions.get(startTree)!;
    const tree = new Tree<WeightedProgram>(definition.head);
    const subTrees = definition.children.map((child) => buildTree(child, definitions));
    subTrees.forEach((subTree) => tree.appendTree(subTree));
    return tree;
};

interface UnbalancedResult {
    isUnbalanced: true;
    requiredWeight: number;
}

interface BalancedResult {
    isUnbalanced: false;
    totalWeight: number;
    headWeight: number;
}


type CheckResult = UnbalancedResult | BalancedResult;

const isUnbalanced = (e: CheckResult): e is UnbalancedResult => {
    return e.isUnbalanced;
};

const findUnbalancedIndex = (weights: number[]): number | null => {
    const min = weights.reduce((acc, next) => Math.min(acc, next));
    const max = weights.reduce((acc, next) => Math.max(acc, next));
    if (min === max) {
        return null;
    }
    const isMinUnbalanced = weights.filter((w) => w === min).length === 1;
    const target = isMinUnbalanced ? min : max;
    return weights.indexOf(target);
};
const checkWeight = (tree: Tree<WeightedProgram>): CheckResult => {
    if (tree.children.length === 0) {
        return {
            isUnbalanced: false,
            totalWeight: tree.head.weight,
            headWeight: tree.head.weight
        };
    }
    const childrenResults = tree.children.map((child) => checkWeight(child));
    const unbalancedResults = childrenResults.filter((e) => isUnbalanced(e));
    if (unbalancedResults.length > 0) {
        return unbalancedResults[0];
    }
    const balancedResults: BalancedResult[] = childrenResults.map((e) => e as BalancedResult);
    const childrenWeights = balancedResults.map((e) => e.totalWeight);
    const unbalancedIndex = findUnbalancedIndex(childrenWeights);
    if (unbalancedIndex === null) {
        return {
            isUnbalanced: false,
            totalWeight: childrenWeights.reduce((acc, next) => acc + next) + tree.head.weight,
            headWeight: tree.head.weight
        };
    }
    const otherIndex = (unbalancedIndex + 1) % balancedResults.length;
    const delta = balancedResults[unbalancedIndex].totalWeight - balancedResults[otherIndex].totalWeight;
    const result: UnbalancedResult = {
        isUnbalanced: true,
        requiredWeight: balancedResults[unbalancedIndex].headWeight - delta
    };
    return result;
};

interface WeightedProgram {
    weight: number;
    name: string;
}

interface DiscDefinition {
    head: WeightedProgram;
    children: string[];
}
export const recursiveCircus = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const bottomValue = findBottom(lines);

        await outputCallback(bottomValue);

    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const definitions = parseLines(lines);
        const bottom = findBottom(lines);
        const tree = buildTree(bottom, definitions);
        const checkResult = checkWeight(tree);
        await outputCallback(checkResult);
    },
    { key: "recursive-circus", title: "Recursive Circus", stars: 2, }
);

function findBottom(lines: string[]) {
    const withRightSide = lines.filter((l) => l.indexOf(">") >= 0);
    const onlyRightHand = withRightSide.map((line) => line.split(">")[1].trim());
    const rightHandValues = new Set<string>(onlyRightHand
        .flatMap((right) => right.split(",")
            .map((e) => e.trim())));
    const leftValues = lines.map((line) => line.split(" ")[0].trim());
    const bottomValue = leftValues.filter((value) => !rightHandValues.has(value))[0];
    return bottomValue;
}

