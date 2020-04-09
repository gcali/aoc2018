import { entryForFile } from "../../entry";
import { FixedSizeMatrix } from '../../../support/matrix';
import { manhattanDistance, Coordinate, CCoordinate } from '../../../support/geometry';

type Grid = FixedSizeMatrix<string>;

const flipHorizontal = (matrix: Grid): Grid => {
    const newGrid: Grid = new FixedSizeMatrix<string>(matrix.size);
    matrix.onEveryCell((coordinate, cell) => {
        newGrid.set({y: coordinate.y, x: matrix.size.x - coordinate.x - 1}, cell!);
    });
    return newGrid;
}

const generateAllSymmetries = (matrix: Grid): Grid[] => {
    const result = [];
    result.push(matrix.copy());
    for (let i = 0; i < 4; i++) {
        matrix = flipHorizontal(matrix);
        result.push(matrix);
        matrix = transpose(matrix);
        result.push(matrix);
    }
    return result;
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
    const size = fullGrid.size.x % 2 === 0 ? 2 : 3;
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
            const setCoordinate = {
                x: coordinate.x + subGrid.delta.x * subSize,
                y: coordinate.y + subGrid.delta.y * subSize,

            };
            if (resultGrid.get(setCoordinate) !== undefined) {
                throw new Error("Join is overwriting data");
            }
            resultGrid.set(setCoordinate, cell!);
        });
    });
    return resultGrid;
}
const transpose = (matrix: Grid): Grid => {
    const result = new FixedSizeMatrix<string>(matrix.size);
    matrix.onEveryCell((coordinate, cell) => {
        result.set({x: coordinate.y, y: coordinate.x}, cell!);
    });
    return result;
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
        const sizes = [];
        const total = 5;
        let grid = startGrid;
        sizes.push(grid.size.x);
        for (let i = 0; i < total; i++) {
            grid = iterate(grid, rules);
            sizes.push(grid.size.x);
        };
        await outputCallback(grid.toString(e => e || " "));
        await outputCallback(grid.data.filter(e => e === "#").length);
    },
    async ({ lines, outputCallback }) => {
        const startGrid = new FixedSizeMatrix<string>({x: 3, y: 3});
        startGrid.setFlatData(".#...####".split(""));
        const rules = parseRules(lines);
        const sizes = [];
        const total = 18;
        let grid = startGrid;
        sizes.push(grid.size.x);
        for (let i = 0; i < total; i++) {
            await outputCallback("Iteration: " + i);
            grid = iterate(grid, rules);
            sizes.push(grid.size.x);
        };
        await outputCallback(grid.data.filter(e => e === "#").length);
    },
    { key: "fractal-art", title: "Fractal Art", stars: 2, }
);