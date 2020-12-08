import { sumCoordinate } from '../../../../support/geometry';
import { Instruction } from '.';
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from '../../../entry';

export interface IHandheldHalting {
    setup(program: Instruction[], instances: number): Promise<void>;
    setExecuted(programNumber: number, instruction: number): Promise<void>;
}

const constants = (() => {
    const instructionSize = { x: 20, y: 2};
    const instructionSpacing = {x: 4, y: 2};
    const instructionOffset = sumCoordinate(instructionSize, instructionSpacing);
    return {
        instructionSize,
        instructionSpacing,
        instructionOffset,
        screenSizeBuilder(lines: number, programs: number) {
            return {
                x: instructionOffset.x * programs + instructionSpacing.x,
                y: instructionOffset.y * lines + instructionSpacing.y
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

class RealVisualizer implements IHandheldHalting {
    private printer!: ScreenPrinter;
    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) { 
    }
    private programDrawables: LocalDrawable[][] = [];
    async setup(program: Instruction[], instances: number): Promise<void> {
        const screenSize = constants.screenSizeBuilder(program.length, instances);
        this.printer = await this.screenBuilder.requireScreen(screenSize);
        this.printer.setManualRender();
        this.programDrawables = [];
        for (let programIndex = 0; programIndex < instances; programIndex++) {
            this.programDrawables.push(program.map((instruction, instructionIndex) => {
                const coordinates = {x: programIndex, y: instructionIndex};
                const viewCoordinates = {
                    x: coordinates.x * constants.instructionOffset.x + constants.instructionSpacing.x,
                    y: coordinates.y * constants.instructionOffset.y + constants.instructionSpacing.x
                };
                return {
                    type: "rectangle",
                    color: "white",
                    c: viewCoordinates,
                    id: `${programIndex}|${instructionIndex}`,
                    size: constants.instructionSize
                } as LocalDrawable;
            }));
        }
        this.printer.replace(this.programDrawables.flatMap(d => d));
        this.printer.forceRender();
        await this.pause();
    }
    async setExecuted(programNumber: number, instruction: number): Promise<void> {
        this.programDrawables[programNumber][instruction].color = "red";
        this.printer.forceRender();
        await this.pause();
    }
}

class DummyVisualizer implements IHandheldHalting {
    async setup(program: Instruction[], instances: number): Promise<void> { }
    async setExecuted(programNumber: number, instruction: number): Promise<void> { }

}