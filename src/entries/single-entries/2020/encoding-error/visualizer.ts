import { logarithm } from '../../../../support/algebra';
import { sumCoordinate } from '../../../../support/geometry';
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from '../../../entry';

export interface IEncodingErrorVisualizer {
    setupInvalidFinder(numbers: number[], preamble: number[]): Promise<void>;
    changeBag(preamble: number[]): Promise<void>;
    setCurrent(index: number): Promise<void>;
    setCalculatedBag(index: number): Promise<void>;
    setWinnerBag(index: number): Promise<void>;
    setInvalid(index: number): Promise<void>;
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
        }
    };
})();

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new RealVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
}

type LocalDrawable = Drawable & {type: "rectangle"};

class RealVisualizer implements IEncodingErrorVisualizer {
    private printer!: ScreenPrinter;

    private bagItems: LocalDrawable[] = [];
    private drawableNumbers: LocalDrawable[] = [];
    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) { 
    }
    async setInvalid(index: number): Promise<void> {
        this.drawableNumbers[index].color = "red";
        this.printer.forceRender();
        await this.pause();
    }
    async setWinnerBag(index: number): Promise<void> {
        this.bagItems[index].color = "lime";
        this.printer.forceRender();
        await this.pause(10);
    }

    async setCalculatedBag(index: number): Promise<void> {
        this.bagItems[index].color = "grey";
        this.printer.forceRender();
        await this.pause();
    }

    private k = 10000;
    private maxLog = Number.MAX_VALUE;

    async changeBag(preamble: number[]) {
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

    async setCurrent(index: number) {
        this.drawableNumbers[index].color = "pink";
        if (index > 0) {
            this.drawableNumbers[index-1].color = "lime";
        }
        this.printer.forceRender();
        await this.pause();
    }

    private calculateNumberSize(n: number): number {
        return Math.max(constants.number.size.x * (Math.log2(n + this.k)/this.maxLog), 1);
    }

    async setupInvalidFinder(numbers: number[], preamble: number[]) {
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
            color: "blue",
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
        })

        this.printer.replace([bag].concat(this.bagItems).concat(this.drawableNumbers));
        this.printer.forceRender();
        await this.pause();
    }
}

class DummyVisualizer implements IEncodingErrorVisualizer {
    async setInvalid(index: number): Promise<void> { }
    async setCalculatedBag(index: number): Promise<void> { }
    async setWinnerBag(index: number): Promise<void> { }
    async changeBag(preamble: number[]): Promise<void> { }
    async setCurrent(index: number): Promise<void> { }
    async setupInvalidFinder(numbers: number[], preamble: number[]): Promise<void> { }

}