import { getCoordinateForGrid, multiplyCoordinate, sumCoordinate } from '../../../../support/geometry';
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from '../../../entry';

const constants = (() => {
    const columns = 30;

    const letterColumns = 2;
    const letterRows = 13;

    const letterSpacing = {x: 4, y: 2};
    const letterSize = {x: 8, y: 4};
    const letterOffset = sumCoordinate(letterSpacing, letterSize);

    const groupSpacing = {
        x: 4,
        y: 4
    };
    const groupSize = {
        x: letterSpacing.x + letterColumns * letterOffset.x,
        y: letterSpacing.y + letterRows * letterOffset.y 
    }

    const groupOffset = sumCoordinate(groupSize, groupSpacing);

    return {
        columns,
        groupSize,
        groupSpacing,
        groupOffset,
        letterSize,
        letterOffset,
        letterSpacing,
        letterRows,
        rows: 0,
        screenSizeBuilder(entries: number) {
            const rows = Math.ceil(entries/columns);
            this.rows = rows;
            return {
                x: columns * groupOffset.x + groupSpacing.x,
                y: rows * groupOffset.y + groupSpacing.y
            };
        }
    };
})();
export interface ICustomCustomsVisualizer {
    setup(groups: number): Promise<void>;
    addLetter(group: number, letter: string): Promise<void>;
}

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new RealVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
}

type LocalDrawable = Drawable & {type: "rectangle"};

class RealVisualizer implements ICustomCustomsVisualizer {
    private printer!: ScreenPrinter;
    private drawables: {main: LocalDrawable; letters: LocalDrawable[]}[] = [];
    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) { 
    }
    private getIndex(letter: string): number {
        return letter.charCodeAt(0) - "a".charCodeAt(0);
    }
    async setup(groups: number): Promise<void> {
        const screenSize = constants.screenSizeBuilder(groups);
        this.printer = await this.screenBuilder.requireScreen(screenSize);
        this.printer.setManualRender();
        for (let i = 0; i < groups; i++) {
            const coordinates = {
                x: Math.floor(i / constants.rows),
                y: i % constants.rows
            };
            const viewCoordinates = {
                x: constants.groupSpacing.x + constants.groupOffset.x * coordinates.x,
                y: constants.groupSpacing.y + constants.groupOffset.y * coordinates.y
            };
            this.drawables.push({
                main: {
                    type: "rectangle",
                    color: "white",
                    id: "main-" + i.toString(),
                    size: constants.groupSize,
                    c: viewCoordinates
                },
                letters: [...Array(26).keys()].map(iLetter => {
                    const letterCoordinates = getCoordinateForGrid(iLetter, constants.letterRows);
                    const letterViewCoordinates = 
                        sumCoordinate(
                            sumCoordinate(
                                multiplyCoordinate(
                                    letterCoordinates,
                                    constants.letterOffset
                                ),
                                viewCoordinates)
                            ,
                            constants.letterSpacing
                        );
                    return {
                        type: "rectangle",
                        size: constants.letterSize,
                        c: letterViewCoordinates,
                        color: "slategray",
                        id: `${i}-${iLetter}`
                    };
                })
            });
        }
        const totalDrawables = this.drawables.flatMap(d => [
            d.main
        ].concat(d.letters));
        await this.printer.replace(totalDrawables);
        this.printer.forceRender();
        await this.pause();
    }
    async addLetter(group: number, letter: string): Promise<void> {
        this.drawables[group].letters[this.getIndex(letter)].color = "lime";
        this.printer.forceRender();
        await this.pause();
    }
}

class DummyVisualizer implements ICustomCustomsVisualizer {
    async setup(groups: number): Promise<void> { }
    async addLetter(group: number, letter: string): Promise<void> { }

}