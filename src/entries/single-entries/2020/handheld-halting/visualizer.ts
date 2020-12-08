import { sumCoordinate } from '../../../../support/geometry';
import { Instruction } from '.';
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from '../../../entry';

export interface IHandheldHalting {
    setup(program: Instruction[], instances: number): Promise<void>;
    setExecuted(programNumber: number, instruction: number): Promise<void>;
    setStatus(programNumber: number, status: "loop" | "finished"): Promise<void>;
}

const constants = (() => {
    const programSize = {
        x: 50,
        y: 5
    };
    const indicatorSize = {
        x: 0,
        y: programSize.y
    };
    const indicatorSpacing = {
        x: 2,
        y: 0
    };
    const programSpacing = {
        x: 5,
        y: 5
    };
    const programOffset = sumCoordinate(programSize, programSpacing);
    const columns = 7;
    return {
        rows: 0,
        screenSizeBuilder(programs: number) {
            this.rows = Math.ceil(programs / columns);
            return {
                x: programOffset.x * Math.min(columns, programs) + programSpacing.x,
                y: programOffset.y * this.rows + programSpacing.y
            };
        },
        columns,
        programOffset,
        programSize,
        programSpacing,
        indicatorSize,
        indicatorSpacing
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
    async setStatus(programNumber: number, status: 'loop' | 'finished'): Promise<void> {
        for (let i = 0; i <= programNumber; i++) {
            this.updateSize(i);
        }
        this.programs[programNumber].drawable.color = status === "loop" ? "red" : "lime";
        this.printer.forceRender();
        await this.pause();
        for (let i = programNumber + 1; i < this.programs.length; i++) {
            this.updateSize(i);
            this.printer.forceRender();
            await this.pause();
        }
    }
    // private programDrawables: LocalDrawable[][] = [];
    private programs: {
        drawable: LocalDrawable,
        instructionsToDraw: number
    }[] = [];
    private sizeIncrement = 0;
    async setup(program: Instruction[], instances: number, expectedFill: number = 1): Promise<void> {
        const screenSize = constants.screenSizeBuilder(instances);

        this.sizeIncrement = (constants.programSize.x - 1) / (program.length * expectedFill);

        this.printer = await this.screenBuilder.requireScreen(screenSize);
        this.printer.setManualRender();
        
        const toDraw: Drawable[] = [];

        for (let i = 0; i < instances; i++) {
            const coordinate = {
                x: i % constants.columns,
                y: Math.floor(i / constants.columns)
            };
            const viewCoordinates = {
                x: coordinate.x * constants.programOffset.x + constants.programSpacing.x,
                y: coordinate.y * constants.programOffset.y + constants.programSpacing.y
            };

            const drawableProgram: LocalDrawable = {
                c: viewCoordinates,
                color: "white",
                id: `program-${i}`,
                size: {...constants.programSize, x: 1},
                type: "rectangle"
            };
            toDraw.push(drawableProgram);
            this.programs.push({drawable: drawableProgram, instructionsToDraw: 0});

            const indicator: LocalDrawable = {
                c: {
                    x: viewCoordinates.x + constants.programSize.x + constants.indicatorSpacing.x,
                    y: viewCoordinates.y
                },
                color: "white",
                id: `indicator-${i}`,
                size: constants.indicatorSize,
                type: "rectangle"
            };
            toDraw.push(indicator);
        }

        this.printer.replace(toDraw);
        this.printer.forceRender();
        await this.pause();
    }
    private updateSize(programNumber: number) {
        const p = this.programs[programNumber];
        p.drawable.size.x += (this.sizeIncrement * p.instructionsToDraw);
        p.instructionsToDraw = 0;
    }

    async setExecuted(programNumber: number, instruction: number): Promise<void> {
        const p = this.programs[programNumber];
        p.instructionsToDraw++;
        if (p.instructionsToDraw > 20) {
            this.updateSize(programNumber);
            this.printer.forceRender();
            await this.pause();
        }
    }
}

class DummyVisualizer implements IHandheldHalting {
    async setStatus(programNumber: number, status: 'loop' | 'finished'): Promise<void> { }
    async setup(program: Instruction[], instances: number): Promise<void> { }
    async setExecuted(programNumber: number, instruction: number): Promise<void> { }

}