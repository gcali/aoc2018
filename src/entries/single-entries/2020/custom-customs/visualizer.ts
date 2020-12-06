import { getCoordinateForGrid, multiplyCoordinate, sumCoordinate } from "../../../../support/geometry";
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from "../../../entry";

const constants = (() => {
    const columns = 12;

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
    };

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
        rows: 1,
        screenSizeBuilder(entries: number) {
            return {
                x: columns * groupOffset.x + groupSpacing.x,
                y: 1 * groupOffset.y + groupSpacing.y
            };
        }
    };
})();
export interface ICustomCustomsVisualizer {
    setup(groups: number): Promise<void>;
    addLetter(group: number, letter: string): Promise<void>;
    setLetters(group: number, letters: Iterable<string>): Promise<void>;
    startGroup(group: number): Promise<void>;
    endGroup(group: number): Promise<void>;
}

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new RealVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
};

type LocalDrawable = Drawable & {type: "rectangle"};

const clear = "slategray";
const ok = "lime";

class RealVisualizer implements ICustomCustomsVisualizer {
    private printer!: ScreenPrinter;
    private drawables: Array<{main: LocalDrawable; letters: LocalDrawable[]}> = [];
    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) {
    }
    public async setLetters(group: number, letters: Iterable<string>): Promise<void> {
        this.clearLetters(group);
        for (const letter of letters) {
            this.drawables[this.getGroupIndex(group)].letters[this.getIndex(letter)].color = ok;
        }
        this.printer.forceRender();
        await this.pause();
    }

    public async startGroup(group: number): Promise<void> {
        const index = this.getGroupIndex(group);
        this.clearPreviousLetters(index);
    }
    public async endGroup(group: number): Promise<void> {
    }
    public async setup(groups: number): Promise<void> {
        const screenSize = constants.screenSizeBuilder(groups);
        this.printer = await this.screenBuilder.requireScreen(screenSize);
        this.printer.setManualRender();
        for (let i = 0; i < constants.columns; i++) {
            const coordinates = {
                x: i,
                y: 0
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
                letters: [...Array(26).keys()].map((iLetter) => {
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
                        color: clear,
                        id: `${i}-${iLetter}`
                    };
                })
            });
        }
        const totalDrawables = this.drawables.flatMap((d) => [
            d.main
        ].concat(d.letters));
        await this.printer.replace(totalDrawables);
        this.printer.forceRender();
        await this.pause();
    }
    public async addLetter(group: number, letter: string): Promise<void> {
        this.drawables[this.getGroupIndex(group)].letters[this.getIndex(letter)].color = ok;
        this.printer.forceRender();
        await this.pause();
    }
    private getGroupIndex(group: number) {
        return group % constants.columns;

    }
    private clearPreviousLetters(i: number) {
        const previous = [1].map((k) => i + constants.columns + k).map((e) => e % constants.columns);
        for (const p of previous) {
            this.clearLetters(p);
        }
    }

    private clearLetters(p: number) {
        this.drawables[this.getGroupIndex(p)].letters.forEach((l) => l.color = clear);
    }
    private getIndex(letter: string): number {
        return letter.charCodeAt(0) - "a".charCodeAt(0);
    }
}

class DummyVisualizer implements ICustomCustomsVisualizer {
    public async setLetters(group: number, letters: Iterable<string>): Promise<void> { }
    public async startGroup(group: number): Promise<void> { }
    public async endGroup(group: number): Promise<void> { }
    public async setup(groups: number): Promise<void> { }
    public async addLetter(group: number, letter: string): Promise<void> { }

}
