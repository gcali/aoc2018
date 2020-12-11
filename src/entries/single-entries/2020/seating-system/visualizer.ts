import { Grid } from ".";
import { Coordinate, multiplyCoordinate, serialization } from "../../../../support/geometry";
import { FixedSizeMatrix } from "../../../../support/matrix";
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from "../../../entry";

export interface ISeatingSystemVisualizer {
    setup(size: Coordinate): Promise<void>;
    update(grid: Grid): Promise<void>;
}

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new RealVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
};

const constants = (() => {
    const cellSize = {x: 4, y: 4};
    return {
        cellSize
    };
})();

type LocalDrawable = Drawable & {type: "rectangle"};

class RealVisualizer implements ISeatingSystemVisualizer {
    private printer!: ScreenPrinter;
    private drawables!: FixedSizeMatrix<Drawable>;

    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) {
    }
    public async setup(size: Coordinate): Promise<void> {
        const screenSize = multiplyCoordinate(size, constants.cellSize);
        this.printer = await this.screenBuilder.requireScreen(screenSize);
        this.printer.setManualRender();

        this.drawables = new FixedSizeMatrix<LocalDrawable>(size);
        this.drawables.fillFactory((c) => {
            return {
                c: multiplyCoordinate(constants.cellSize, c),
                id: serialization.serialize(c),
                color: this.mapState("."),
                type: "rectangle",
                size: constants.cellSize
            };
        });

        this.printer.replace(this.drawables.getFlatData());

        this.printer.forceRender();
        await this.pause();
    }
    public async update(grid: Grid): Promise<void> {
        grid.onEveryCellSync((c, e) => {
            this.drawables.get(c)!.color = this.mapState(e!);
        });
        this.printer.forceRender();
        await this.pause();
    }

    private mapState(cell: "#" | "." | "L"): string {
        if (cell === "#") {
            return "#ff6961";//"red";
        } else if (cell === ".") {
            return "white";
        } else {
            return "#77dd77";//"lime";
        }
    }
}

class DummyVisualizer implements ISeatingSystemVisualizer {
    public async setup(size: Coordinate): Promise<void> { }
    public async update(grid: Grid): Promise<void> { }

}
