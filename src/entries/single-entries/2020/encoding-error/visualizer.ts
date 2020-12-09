import { logarithm } from "../../../../support/algebra";
import { Coordinate, sumCoordinate } from "../../../../support/geometry";
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from "../../../entry";

export interface IEncodingErrorVisualizer {
    setupInvalidFinder(numbers: number[], preamble: number[]): Promise<void>;
    changeBag(preamble: number[]): Promise<void>;
    setCurrent(index: number): Promise<void>;
    setCalculatedBag(index: number): Promise<void>;
    setWinnerBag(index: number): Promise<void>;
    setInvalid(index: number): Promise<void>;

    setupWeakness(numbers: number[]): Promise<void>;
    addBagItem(number: number): Promise<void>;
    updateBagSize(index: number, newSize: number): Promise<void>;
    setWrongBag(index: number): Promise<void>;
}

const constants = (() => {
    const columns = 20;
    const numberSize = {
        x: 10,
        y: 2
    };
    const numberSpacing = {
        x: 2,
        y: 2
    };
    const numberOffset = sumCoordinate(numberSize, numberSpacing);

    const bagColumns = 5;
    const bagRows = 5;
    const bagSize = {
        x: numberSpacing.x + numberOffset.x * bagColumns,
        y: numberSpacing.y + numberOffset.y * bagRows
    };

    return {
        columns,
        number: {
            size: numberSize,
            spacing: numberSpacing,
            offset: numberOffset,
        },
        bag: {
            size: bagSize,
            columns: bagColumns,
            rows: bagRows
        },
        screenSizeBuilder(hasBag: boolean, entries: number[]) {
            const baseSize = hasBag ? sumCoordinate(bagSize, numberSpacing) : numberSpacing;
            const rows = Math.floor(entries.length / columns);
            return {
                x: Math.max(baseSize.x, columns * numberOffset.x + numberSpacing.x),
                y: baseSize.y + numberSpacing.y + rows * numberOffset.y
            };
        },
        bigBagSizeBuilder(entries: number[]) {
            const rows = Math.floor(entries.length / columns);
            return {
                x: columns * numberOffset.x + numberSpacing.x * 2,
                y: rows * numberOffset.y + numberSpacing.y * 2
            };
        },
        weaknessScreenSizeBuilder(entries: number[]) {
            const bs = this.bigBagSizeBuilder(entries);
            const rows = Math.floor(entries.length / columns);
            return {
                x: bs.x,
                y: bs.y + numberSpacing.y + numberOffset.y * rows
            };
        }
    };
})();

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new RealVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
};

type LocalDrawable = Drawable & {type: "rectangle"};

class RealVisualizer implements IEncodingErrorVisualizer {
    private printer!: ScreenPrinter;

    private bagItems: LocalDrawable[] = [];
    private drawableNumbers: LocalDrawable[] = [];

    private k = 10000;
    private maxLog = Number.MAX_VALUE;
    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) {
    }

    public async setupWeakness(numbers: number[]) {
        this.printer = await this.screenBuilder.requireScreen(constants.weaknessScreenSizeBuilder(numbers));
        this.printer.setManualRender();
        const maxNumber = numbers.reduce((acc, next) => Math.max(acc, next));

        this.maxLog = Math.log2(maxNumber + this.k);
        const bagSize = constants.bigBagSizeBuilder(numbers);
        const bag: LocalDrawable = {
            c: constants.number.spacing,
            id: "bag",
            color: "darkblue",
            size: bagSize,
            type: "rectangle"
        };
        this.bagItems = [];

        this.drawableNumbers = numbers.map((n, i) => {
            const coordinates = {
                x: i % constants.columns,
                y: Math.floor(i / constants.columns)
            };
            const viewCoordinates = {
                x: constants.number.spacing.x + constants.number.offset.x * coordinates.x,
                y: bag.c.y + bag.size.y + constants.number.spacing.y + constants.number.offset.y * coordinates.y,
            };
            return {
                c: viewCoordinates,
                color: "white",
                id: `n-${i}`,
                size: {
                    x: this.calculateNumberSize(n),
                    y: constants.number.size.y
                },
                type: "rectangle"
            } as LocalDrawable;
        });

        this.printer.replace([bag].concat(this.bagItems).concat(this.drawableNumbers));
        this.printer.forceRender();
        await this.pause();
    }

    public async addBagItem(number: number) {
        const newIndex = this.bagItems.length;
        const coordinates = {
            x: newIndex % constants.columns,
            y: Math.floor(newIndex / constants.columns)
        };
        const viewCoordinates = {
            x: constants.number.spacing.x * 2 + coordinates.x * constants.number.offset.x,
            y: constants.number.spacing.y * 2 + coordinates.y * constants.number.offset.y,
        };
        const newItem: LocalDrawable = {
            id: `bag-item-${newIndex}`,
            color: "white",
            size: {
                x: this.calculateNumberSize(number),
                y: constants.number.size.y
            },
            type: "rectangle",
            c: viewCoordinates
        };
        this.bagItems.push(newItem);
        await this.printer.add(newItem);
        this.printer.forceRender();
        await this.pause();
    }

    public async updateBagSize(index: number, newSize: number) {
        this.bagItems[index].size.x = this.calculateNumberSize(newSize);
    }

    public async setWrongBag(index: number) {
        this.bagItems[index].color = "red";
        this.printer.forceRender();
        await this.pause();
    }

    public async setInvalid(index: number): Promise<void> {
        this.drawableNumbers[index].color = "red";
        this.printer.forceRender();
        await this.pause();
    }
    public async setWinnerBag(index: number): Promise<void> {
        this.bagItems[index].color = "lime";
        this.printer.forceRender();
        await this.pause(10);
    }

    public async setCalculatedBag(index: number): Promise<void> {
        this.bagItems[index].color = "grey";
        this.printer.forceRender();
        await this.pause();
    }

    public async changeBag(preamble: number[]) {
        if (preamble.length !== 25) {
            throw new Error("Cannot run without 25 items in preamble");
        }
        for (let i = 0; i < preamble.length; i++) {
            this.bagItems[i].size.x = this.calculateNumberSize(preamble[i]);
            this.bagItems[i].color = "white";
        }
        this.printer.forceRender();
        await this.pause();
    }

    public async setCurrent(index: number) {
        this.drawableNumbers[index].color = "pink";
        if (index > 0) {
            this.drawableNumbers[index - 1].color = "lime";
        }
        this.printer.forceRender();
        await this.pause();
    }

    public async setupInvalidFinder(numbers: number[], preamble: number[]) {
        this.printer = await this.screenBuilder.requireScreen(constants.screenSizeBuilder(true, numbers));
        this.printer.setManualRender();
        if (preamble.length !== 25) {
            throw new Error("Cannot run without 25 items in preamble");
        }
        const maxNumber = numbers.reduce((acc, next) => Math.max(acc, next));
        this.maxLog = Math.log2(maxNumber + this.k);
        const bag: LocalDrawable = {
            c: constants.number.spacing,
            id: "bag",
            color: "darkblue",
            size: constants.bag.size,
            type: "rectangle"
        };
        this.bagItems = preamble.map((n, i) => {
            const coordinates = {
                x: i % constants.bag.columns,
                y: Math.floor(i / constants.bag.columns)
            };
            const viewCoordinates = {
                x: bag.c.x + coordinates.x * constants.number.offset.x + constants.number.spacing.x,
                y: bag.c.y + coordinates.y * constants.number.offset.y + constants.number.spacing.y
            };
            return {
                c: viewCoordinates,
                color: "white",
                id: `bag-${i}`,
                size: {
                    x: this.calculateNumberSize(n),
                    y: constants.number.size.y
                },
                type: "rectangle"
            } as LocalDrawable;
        });

        this.drawableNumbers = numbers.map((n, i) => {
            const coordinates = {
                x: i % constants.columns,
                y: Math.floor(i / constants.columns)
            };
            const viewCoordinates = {
                x: constants.number.spacing.x + constants.number.offset.x * coordinates.x,
                y: bag.c.y + bag.size.y + constants.number.spacing.y + constants.number.offset.y * coordinates.y,
            };
            return {
                c: viewCoordinates,
                color: i < 25 ? "grey" : "white",
                id: `n-${i}`,
                size: {
                    x: this.calculateNumberSize(n),
                    y: constants.number.size.y
                },
                type: "rectangle"
            } as LocalDrawable;
        });

        this.printer.replace([bag].concat(this.bagItems).concat(this.drawableNumbers));
        this.printer.forceRender();
        await this.pause();
    }

    private calculateNumberSize(n: number): number {
        return Math.max(constants.number.size.x * (Math.log2(n + this.k) / this.maxLog), 1);
    }
}

class DummyVisualizer implements IEncodingErrorVisualizer {
    public async setupWeakness(numbers: number[]): Promise<void> { }
    public async addBagItem(number: number): Promise<void> { }
    public async updateBagSize(index: number, newSize: number): Promise<void> { }
    public async setWrongBag(index: number): Promise<void> { }
    public async setInvalid(index: number): Promise<void> { }
    public async setCalculatedBag(index: number): Promise<void> { }
    public async setWinnerBag(index: number): Promise<void> { }
    public async changeBag(preamble: number[]): Promise<void> { }
    public async setCurrent(index: number): Promise<void> { }
    public async setupInvalidFinder(numbers: number[], preamble: number[]): Promise<void> { }

}
