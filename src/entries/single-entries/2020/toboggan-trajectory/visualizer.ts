import { Coordinate, scalarCoordinates, serialization } from '../../../../support/geometry';
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from '../../../entry';

export interface ITobogganTrajectoryVisualizer {
    setupField(grid: string[][], size: Coordinate): Promise<void>;
    moveToboggan(position: Coordinate, collides: boolean): Promise<void>;
    resetField(): Promise<void>;
}

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new TobogganVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
}

const constants = {
    cellSize: 2,
    fullCellSize: {x: 2, y: 2}
};

interface Dictionary<T> { [key: string]: T; }

class TobogganVisualizer implements ITobogganTrajectoryVisualizer {
    private screen!: ScreenPrinter;
    private readonly trees: Dictionary<Drawable & {type: "rectangle"}> = {};
    private readonly player: Drawable & {type: "rectangle"} = {
        type: "rectangle", 
        id: "player", 
        color: "white", 
        size: constants.fullCellSize, 
        c: {x: 0, y: 0}
    };
    constructor(
        private readonly screenBuilder: ScreenBuilder, 
        private readonly pause: Pause
    ) { }

    async setupField(grid: string[][], size: Coordinate): Promise<void> {
        this.screen = await this.screenBuilder.requireScreen(scalarCoordinates(size, constants.cellSize));
        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                if (grid[y][x] === "#") {
                    this.trees[serialization.serialize({x,y})] = {
                        type: "rectangle",
                        c: scalarCoordinates({x,y}, constants.cellSize),
                        id: serialization.serialize({x,y}),
                        color: "lime",
                        size: constants.fullCellSize
                    };
                }
            }
        }
        this.screen.replace(Object.values(this.trees));
        this.screen.add(this.player);
        await this.pause();
    }
    async resetField() {
        for (const tree of Object.values(this.trees)) {
            tree.color = "lime";
        }
        this.player.c = {x: 0, y: 0};
        await this.pause();
    }
    async moveToboggan(position: Coordinate, collides: boolean): Promise<void> {
        this.player.c = scalarCoordinates(position, constants.cellSize);
        if (collides) {
            this.trees[serialization.serialize(position)].color = "red";
        }
        await this.pause();
    }

}

class DummyVisualizer implements ITobogganTrajectoryVisualizer {
    async setupField(grid: string[][]): Promise<void> {
    }
    async moveToboggan(position: Coordinate, collides: boolean): Promise<void> {
    }
    async resetField() {
    }

}