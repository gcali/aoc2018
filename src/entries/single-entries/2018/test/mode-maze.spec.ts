import "mocha";
import { FixedSizeMatrix } from "../../../../support/matrix";
import {
    ErosionLevel,
    calculatePath,
    serializeNode,
    deserializeNode,
    Node as AoCNode,
    createErosionMatrixFromInput,
    matrixSerializer,
} from "../mode-maze";
import { expectSameArrays } from "../../../../support/assertions";
import { expect } from "chai";
import { manhattanDistance } from "../../../../support/geometry";

const expectedErosions: number[][] = [
    [510, 17317, 13941, 10565, 7189, 3813, 437, 17244, 13868, 10492, 7116, 3740, 364, 17171, 13795, 10419],
    [8415, 1805, 15997, 16556, 2443, 11306, 16580, 13835, 4692, 2637, 15395, 15894, 13588, 4578, 1413, 9150],
    [16320, 11113, 3307, 14906, 5736, 3747, 2496, 19740, 803, 18989, 5593, 9720, 18501, 10220, 10525, 11167],
    [4042, 12081, 10220, 18729, 16128, 4224, 8088, 10100, 17427, 1345, 15019, 1551, 15518, 16639, 18277, 9273],
    [11947, 3584, 17028, 6339, 9007, 1123, 984, 8874, 5562, 13690, 6399, 15506, 892, 7993, 4017, 12516],
    [19852, 5003, 19334, 7560, 16171, 16026, 7171, 19148, 16178, 9271, 7802, 1420, 15804, 16668, 8855, 4837],
    [7574, 9741, 5431, 6648, 10660, 8758, 14815, 6065, 10517, 19727, 15189, 13446, 14470, 19803, 6171, 19163],
    [15479, 14439, 7764, 7651, 667, 9209, 14948, 18277, 17010, 14405, 14335, 1270, 10880, 3625, 7621, 17728],
    [3201, 679, 4503, 582, 5227, 19681, 4690, 2439, 11835, 18067, 2699, 17313, 18194, 15899, 8240, 14859],
    [11106, 13225, 12835, 2770, 8089, 16798, 8881, 4910, 3503, 15506, 11845, 13715, 8791, 1344, 14786, 13729],
    [19011, 1354, 1537, 19570, 6971, 17785, 17120, 17698, 14611, 4501, 510, 19823, 4481, 8440, 2861, 3061],
    [6733, 14459, 2510, 15971, 4923, 2211, 9705, 2270, 6811, 19027, 7544, 9375, 9062, 10403, 13751, 10766],
    [14638, 12414, 17281, 13019, 12022, 141, 16654, 2331, 13113, 19498, 19901, 733, 2749, 19229, 1006, 13018],
    [2360, 12017, 3400, 3791, 2698, 17634, 14496, 4344, 6956, 19021, 5266, 5535, 18426, 1499, 14962, 9876],
    [10265, 16702, 12531, 14932, 1778, 9563, 8914, 11932, 7006, 13470, 10468, 15680, 545, 10145, 13840, 5074],
    [18170, 4262, 3414, 16283, 9262, 10012, 18435, 12596, 8010, 17075, 962, 7969, 4270, 6942, 6710, 18512]
];

const myInput = {
    depth: 5616,
    target: { x: 10, y: 785 }
};

const siteInput = {
    depth: 510,
    target: { x: 10, y: 10 }
};

const costCalculator = (serializedNodes: string[], startNode: AoCNode): number => {
    let lastTool = startNode.tool;
    let lastPos = startNode.coordinate;
    let cost = 0;
    const firstNode = deserializeNode(serializedNodes[0]);
    expect(manhattanDistance(firstNode.coordinate, startNode.coordinate)).to.equal(0);
    expect(firstNode.tool).to.equal(startNode.tool);
    for (let i = 1; i < serializedNodes.length; i++) {
        const node = deserializeNode(serializedNodes[i]);
        if (lastTool !== node.tool) {
            cost += 7;
            if (manhattanDistance(lastPos, node.coordinate) !== 0) {
                throw new Error("Expected same pos when switching tools");
            }
        } else {
            const distance = manhattanDistance(lastPos, node.coordinate);
            if (distance !== 1) {
                throw new Error(`Expected exactly one step: ${JSON.stringify(lastPos)} ${JSON.stringify(node.coordinate)} `);
            }
            cost += 1;
        }
        lastTool = node.tool;
        lastPos = node.coordinate;
    }
    return cost;
};

describe("Node maze", () => {
    it("should find empty path", () => {
        const matrix = new FixedSizeMatrix<ErosionLevel>({ x: 1, y: 1 });
        matrix.setFlatData([0]);
        const resultPath = calculatePath(matrix, { x: 0, y: 0 });
        expect(resultPath.cost).to.equal(0);
        expect(resultPath.path).to.be.null;
    });
    it("should find single step path", () => {
        const matrix = new FixedSizeMatrix<ErosionLevel>({ x: 2, y: 1 });
        matrix.setFlatData([0, 0]);
        const resultPath = calculatePath(matrix, { x: 1, y: 0 });
        expect(resultPath.cost).to.equal(1);
        expectSameArrays(resultPath.path, [
            serializeNode({ coordinate: { x: 0, y: 0 }, tool: "light" }),
            serializeNode({ coordinate: { x: 1, y: 0 }, tool: "light" })
        ]);
    });
    it("should find two step path", () => {
        const matrix = new FixedSizeMatrix<ErosionLevel>({ x: 3, y: 1 });
        matrix.setFlatData([0, 0, 0]);
        const resultPath = calculatePath(matrix, { x: 2, y: 0 });
        expect(resultPath.cost).to.equal(2);
        expectSameArrays(resultPath.path, [
            serializeNode({ coordinate: { x: 0, y: 0 }, tool: "light" }),
            serializeNode({ coordinate: { x: 1, y: 0 }, tool: "light" }),
            serializeNode({ coordinate: { x: 2, y: 0 }, tool: "light" })
        ]);
    });
    it("should find two step with tool change path", () => {
        const matrix = new FixedSizeMatrix<ErosionLevel>({ x: 3, y: 1 });
        matrix.setFlatData([0, 1, 0]);
        const resultPath = calculatePath(matrix, { x: 2, y: 0 });
        expect(resultPath.cost).to.equal(16);
        expectSameArrays(resultPath.path, [
            serializeNode({ coordinate: { x: 0, y: 0 }, tool: "light" }),
            serializeNode({ coordinate: { x: 0, y: 0 }, tool: "climb" }),
            serializeNode({ coordinate: { x: 1, y: 0 }, tool: "climb" }),
            serializeNode({ coordinate: { x: 2, y: 0 }, tool: "climb" }),
            serializeNode({ coordinate: { x: 2, y: 0 }, tool: "light" })
        ]);
    });

    it("creates same erosion map as example", () => {

        const matrix = createErosionMatrixFromInput({
            depth: 510,
            target: { x: 10, y: 10 },
        }, 6);

        expect(matrix.size.x).to.equal(16);
        expect(matrix.size.y).to.equal(16);
        const serializedMatrix = matrix.toString(matrixSerializer);
        const expectedOutput =
            `.=.|=.|.|=.|=|=.
.|=|=|||..|.=...
.==|....||=..|==
=.|....|.==.|==.
=|..==...=.|==..
=||.=.=||=|=..|=
|.=.===|||..=..|
|..==||=.|==|===
.=..===..=|.|||.
.======|||=|=.|=
.===|=|===.===||
=|||...|==..|=.|
=.=|=.=..=.||==|
||=|=...|==.=|==
|=.=||===.|||===
||.|==.|.|.||=||`;
        expectSameArrays(serializedMatrix.split("\n"), expectedOutput.split("\n"));
    });

});
