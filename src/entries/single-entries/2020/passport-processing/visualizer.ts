import { ConstantNodeDependencies } from 'mathjs';
import { Passport, validFields } from '.';
import { scalarCoordinates, sumCoordinate } from '../../../../support/geometry';
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from '../../../entry';

export interface IPassportProcessingVisualizer {
    setupPassports(passports: Passport[]): Promise<void>;
    setWrongFields(passportIndex: number, fields: string[]): Promise<void>;
    setValid(passportIndex: number): Promise<void>;
}

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause) => {
    if (screenBuilder) {
        return new PassportProcessingVisualizer(screenBuilder, pause);
    }
    return new DummyVisualizer();
}

class DummyVisualizer implements IPassportProcessingVisualizer {
    async setValid(passportIndex: number): Promise<void> { }
    async setupPassports(passports: Passport[]): Promise<void> { }
    async setWrongFields(passportIndex: number, fields: string[]): Promise<void> { }

}

const constants = (() => {
    const fieldFullSize = {x: 10, y: 2};
    const fieldColumns = 2;
    const fieldRows = 4;
    const padding = {x: 2, y: 2};
    const internalSpacing = 2;
    const externalSpacing = 4;
    const passportSize = { 
        x: (fieldFullSize.x + internalSpacing) * fieldColumns + internalSpacing + padding.x * 2,
        y: internalSpacing + (fieldFullSize.y + internalSpacing) * fieldRows + internalSpacing + padding.y * 2
    };
    const passportOffset = sumCoordinate(passportSize, {x: externalSpacing, y: externalSpacing});
    const columns = 13;

    return {
        padding,
        fieldRows,
        internalSpacing,
        externalSpacing,
        fieldOffset: {x: fieldFullSize.x + internalSpacing, y: fieldFullSize.y + internalSpacing},
        passportSize,
        columns,
        passportOffset,
        screenWidth: passportOffset.x * columns + externalSpacing,
        fieldFullSize,
        heightCalculator(entries: number) {
            return Math.ceil(entries / columns) * passportOffset.y + externalSpacing;
        }
    };

})();

type LocalDrawable = Drawable & {type: "rectangle"};

class PassportProcessingVisualizer implements IPassportProcessingVisualizer {
    constructor(
        private readonly screenBuilder: ScreenBuilder, 
        private readonly pause: Pause
    ) { }

    async setValid(passportIndex: number): Promise<void> {
        this.passportDrawables[passportIndex].main.color = "lime";
        this.screenPrinter.forceRender();
        await this.pause();
    }

    private passportDrawables: {main: LocalDrawable, fields: {[key: string]: LocalDrawable}}[] = [];

    private screenPrinter!: ScreenPrinter;
    async setupPassports(passports: Passport[]): Promise<void> {
        this.screenPrinter = await this.screenBuilder.requireScreen({x: constants.screenWidth, y: constants.heightCalculator(passports.length)});
        this.screenPrinter.setManualRender();
        const perRow = Math.ceil(passports.length / constants.columns);
        this.passportDrawables= passports.map((p, index) => {
            const coordinates = {y: Math.floor(index / constants.columns), x: index % constants.columns};
            const viewCoordinates = {
                x: coordinates.x * constants.passportOffset.x + constants.externalSpacing, 
                y: coordinates.y * constants.passportOffset.y + constants.externalSpacing
            };
            const main: LocalDrawable = {
                type: "rectangle",
                color: "white",
                id: "passport-" + index,
                size: constants.passportSize,
                c: viewCoordinates,
            };
            const fields: {[key: string]: LocalDrawable} = {};
            for (let i = 0; i < validFields.length; i++) {
                const fieldCoordinates = {x: Math.floor(i/constants.fieldRows), y: i % constants.fieldRows};
                fields[validFields[i]] = {
                    type: "rectangle",
                    color: "grey",
                    c: sumCoordinate({
                        x: fieldCoordinates.x * constants.fieldOffset.x + constants.internalSpacing + constants.padding.x, 
                        y: fieldCoordinates.y * constants.fieldOffset.y + constants.internalSpacing + constants.padding.y
                    }, viewCoordinates),
                    id: `passport-${index}-field-${validFields[i]}`,
                    size: constants.fieldFullSize
                };
            }
            return {main, fields};
        });

        const drawables: Drawable[] = [];
        for (const p of this.passportDrawables) {
            drawables.push(p.main);
            Object.values(p.fields).forEach(i => drawables.push(i));
        }
        await this.screenPrinter.replace(drawables);
        await this.pause();

    }
    async setWrongFields(passportIndex: number, fields: string[]): Promise<void> {
        const passport = this.passportDrawables[passportIndex];
        passport.main.color = "indianred";
        for (const field of fields) {
            passport.fields[field].color = "darkred";
        }
        this.screenPrinter.forceRender();
        await this.pause();
    }
}