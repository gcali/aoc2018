import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from '../../../support/matrix';
import { manhattanDistance, Coordinate, CCoordinate } from '../../../support/geometry';
import { NotImplementedError } from '../../../support/error';

type Grid = FixedSizeMatrix<string>;

const flipHorizontal = (matrix: Grid): Grid => {
    const newGrid: Grid = new FixedSizeMatrix<string>(matrix.size);
    for (let x = 0; x < newGrid.size.x; x++) {
        for (let y = 0; y < newGrid.size.y; y++) {
            newGrid.set({x,y}, matrix.get({y, x: newGrid.size.x - 1 - x})!);
        }
    }
    return newGrid;
}

const generateAllSymmetries = (matrix: Grid): Grid[] => {
    const [base,flipped] = [matrix.copy(), flipHorizontal(matrix)];
    const rotations = matrix.size.x === 3 ? 7 : 3;
    return [base,flipped]
        .concat([...Array(rotations)].reduce((acc: Grid[], next) => [rotate(acc[0])].concat([...acc]), [base]))
        .concat([...Array(rotations)].reduce((acc: Grid[], next) => [rotate(acc[0])].concat([...acc]), [flipped]));
};

const matches = (matrix: Grid, symmetries: Grid[]): boolean => {
    if (manhattanDistance(matrix.size, symmetries[0].size) !== 0) {
        return false;
    }
    for (const symmetry of symmetries) {
        if (matrix.isSameAs(symmetry)) {
            return true;
        }
    }
    return false;
}

interface GridWithDelta {
    grid: Grid;
    delta: Coordinate;
}

const extractGrid = (grid: Grid, offset: Coordinate, size: Coordinate): Grid => {
    const gridResult = new FixedSizeMatrix<string>(size);
    const cOffset = new CCoordinate(offset.x, offset.y);
    for (let x = 0; x < size.x; x++) {
        for (let y = 0; y < size.y; y++) {
            gridResult.set({x, y}, grid.get(cOffset.sum({x,y}))!);
        }
    }
    return gridResult;
};

const splitWithDelta = (fullGrid: Grid): GridWithDelta[] => {
    const size = fullGrid.size.x % 3 === 0 ? 3 : 2;
    const result: GridWithDelta[] = [];
    for (let x = 0; x < fullGrid.size.x; x += size) {
        for (let y = 0; y < fullGrid.size.y; y += size) {
            const subGrid = extractGrid(fullGrid, {x, y}, {x: size, y: size});
            result.push({
                grid: subGrid,
                delta: {x: x/size, y: y/size}
            });
        }
    }
    return result;
};

const joinDeltas = (deltas: GridWithDelta[]): Grid => {
    const subSize = deltas[0].grid.size.x;
    const maxX = deltas.map(d => d.delta.x).reduce((acc, next) => Math.max(acc, next));
    const size = subSize * (maxX + 1);
    const resultGrid = new FixedSizeMatrix<string>({x: size, y: size});
    deltas.forEach(subGrid => {
        subGrid.grid.onEveryCell((coordinate, cell) => {
            resultGrid.set({
                x: coordinate.x + subGrid.delta.x * subSize,
                y: coordinate.y + subGrid.delta.y * subSize,
            }, cell!);
        });
    });
    return resultGrid;
}

const rotate = (matrix: Grid): Grid => {
    const newGrid: Grid = new FixedSizeMatrix<string>(matrix.size);
    if (matrix.size.x === 2) {
        newGrid.set({x:0,y:0}, matrix.get({x:1,y:0})!);
        newGrid.set({x:1,y:0}, matrix.get({x:1,y:1})!);
        newGrid.set({x:1,y:1}, matrix.get({x:0,y:1})!);
        newGrid.set({x:0,y:1}, matrix.get({x:0,y:0})!);
    } else if (matrix.size.x === 3) {
        newGrid.set({x:1,y:1}, matrix.get({x:1,y:1})!);
        newGrid.set({x:0,y:0}, matrix.get({x:1,y:0})!);
        newGrid.set({x:1,y:0}, matrix.get({x:2,y:0})!);
        newGrid.set({x:2,y:0}, matrix.get({x:2,y:1})!);
        newGrid.set({x:2,y:1}, matrix.get({x:2,y:2})!);
        newGrid.set({x:2,y:2}, matrix.get({x:1,y:2})!);
        newGrid.set({x:1,y:2}, matrix.get({x:0,y:2})!);
        newGrid.set({x:0,y:2}, matrix.get({x:0,y:1})!);
        newGrid.set({x:0,y:1}, matrix.get({x:0,y:0})!);
    }
    return newGrid;
}

interface Rule {
    matching: Grid[];
    result: Grid;
}

const parseRules = (lines: string[]): Rule[] => {
    return lines.map(line => line.trim()).filter(line => line.length > 0).map(line => {
        const [left, right] = line.trim().split(" => ");
        const leftFlat = left.split("").filter(e => e !== "/");
        const rightFlat = right.split("").filter(e => e !== "/");
        const leftSize = Math.sqrt(leftFlat.length);
        const rightSize = Math.sqrt(rightFlat.length);
        const baseRuleMatch = new FixedSizeMatrix<string>({x: leftSize, y: leftSize});
        baseRuleMatch.setFlatData(leftFlat);
        const rightGrid = new FixedSizeMatrix<string>({x: rightSize, y: rightSize});
        rightGrid.setFlatData(rightFlat);
        return {
            matching: generateAllSymmetries(baseRuleMatch),
            result: rightGrid
        };
    })
};

const iterate = (grid: Grid, rules: Rule[]): Grid => {
    const splitGrids = splitWithDelta(grid);
    const mappedGrids: GridWithDelta[] = splitGrids.map(subGrid => {
        for (const rule of rules) {
            if (matches(subGrid.grid, rule.matching)) {
                return {
                    ...subGrid,
                    grid: rule.result
                };
            }
        }
        throw new Error("No rule matched");
    });
    return joinDeltas(mappedGrids);
};

export const fractalArt = entryForFile(
    async ({ lines, outputCallback }) => {
        const startGrid = new FixedSizeMatrix<string>({x: 3, y: 3});
        startGrid.setFlatData(".#...####".split(""));
        const rules = parseRules(lines);
        //await outputCallback(rules.filter(rule => rule.result.size.x === 3).flatMap(rule => rule.matching).map(g => g.toString(e => e || " ")).join("\n\n"));
        const total = 5;
        let grid = startGrid;
        for (let i = 0; i < total; i++) {
            grid = iterate(grid, rules);
            //await outputCallback(grid.toString(e => e || " "));
        };
        await outputCallback(grid.toString(e => e || " "));
        await outputCallback(grid.data.filter(e => e === "#").length);
    },
    async ({ lines, outputCallback }) => {
        throw Error("Not implemented");
    }
);