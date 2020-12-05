import { Coordinate, serialization } from "../../../../support/geometry";
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from "../../../entry";

export const buildVisualizer = (screenBuilder: ScreenBuilder | undefined, pause: Pause): IBinaryBoardingVisualizer => {
    if (screenBuilder) {
        return new RealVisualizer(screenBuilder, pause);
    } else {
        return new DummyVisualizer();
    }
};

export interface IBinaryBoardingVisualizer {
    setup(seats: number[]): Promise<void>;
    setSeatOwned(seat: number): Promise<void>;

}

class DummyVisualizer implements IBinaryBoardingVisualizer {
    public async setup(seats: number[]): Promise<void> { }
    public async setSeatOwned(seat: number): Promise<void> { }

}

const constants = (() => {
    const seatSize = {x: 10, y: 3};
    const internalSpacing = {x: 6, y: 3};
    const seatOffset = {x: seatSize.x + internalSpacing.x, y: seatSize.y + internalSpacing.y};
    const columns = 8;
    const expected = 1024;
    const rows = expected / columns;

    const screenSize = {
        x: columns * seatOffset.x + internalSpacing.x,
        y: rows * seatOffset.y + internalSpacing.y
    };

    return {
        rows,
        columns,
        internalSpacing,
        seatSize,
        screenSize,
        seatOffset
    };
})();

type LocalDrawable = Drawable & {type: "rectangle"};

class RealVisualizer implements IBinaryBoardingVisualizer {
    private printer!: ScreenPrinter;
    private readonly drawables: {[key: string]: LocalDrawable} = {};
    constructor(
        private readonly screenBuilder: ScreenBuilder,
        private readonly pause: Pause
    ) { }

    public async setup(seats: number[]): Promise<void> {
        this.printer = await this.screenBuilder.requireScreen(constants.screenSize);
        this.printer.setManualRender();

        for (const seat of seats) {
            const drawable = this.buildDrawable(seat);
            this.drawables[serialization.serialize(drawable.c)] = drawable.d;
        }

        await this.printer.replace(Object.values(this.drawables));
        this.printer.forceRender();
        await this.pause();
    }

    public async setSeatOwned(seat: number): Promise<void> {
        const coordinates = this.getCoordinates(seat);
        const serialized = serialization.serialize(coordinates);
        if (this.drawables[serialized]) {
            this.drawables[serialized].color = "red";
        } else {
            const {d: drawable } = this.buildDrawable(seat);
            drawable.color = "red";
            this.drawables[serialized] = drawable;
            this.printer.add(drawable);
        }
        await this.printer.forceRender();
        await this.pause();
    }

    private getCoordinates(seat: number): Coordinate {
        const coordinates = {
            x: Math.floor(seat / constants.rows),
            y: seat % constants.rows
        };
        return coordinates;
    }

    private buildDrawable(seat: number): {c: Coordinate, d: LocalDrawable} {
        const coordinates = this.getCoordinates(seat);
        const viewCoordinates = {
            x: coordinates.x * constants.seatOffset.x + constants.internalSpacing.x,
            y: coordinates.y * constants.seatOffset.y + constants.internalSpacing.y
        };
        return {
            d: {
                type: "rectangle",
                c: viewCoordinates,
                color: "white",
                id: seat.toString(),
                size: constants.seatSize
            },
            c: coordinates
        };
    }
}
