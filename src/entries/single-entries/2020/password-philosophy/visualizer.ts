import { Coordinate } from "../../../../support/geometry";
import { Drawable, Pause, ScreenBuilder, ScreenPrinter } from "../../../entry";

const constantsBuilder = ((expectedPasswords: number) => {
    const padding = 10;

    const columns = 12;
    const spacing = 2;
    const lineHeight = 4;
    const passwordsPerColumn = expectedPasswords / columns;

    const screenSize = {
        x: 600 + padding * 2,
        y: padding * 2 + passwordsPerColumn * (lineHeight + spacing) + padding * 2
    };

    const indicatorSize = lineHeight;
    const columnLength = (screenSize.x - padding * 2) / columns;
    return {
        screenSize,
        spacing,
        lineHeight,
        indicatorSize,
        columns,
        padding,
        passwordsPerColumn,
        columnLength,
        lineMaxLength: columnLength - padding - spacing - indicatorSize,
    };
});
export const buildVisualizer = async (
    screenBuilder: ScreenBuilder | undefined,
    pause: Pause
): Promise<IPasswordPhilosophyVisualizer> =>
    screenBuilder ? new PasswordPhilosophyVisualizer(screenBuilder, pause) : new DummyPasswordPhilosophyVisualizer();

export interface IPasswordPhilosophyVisualizer {
    setupPasswords(passwords: string[]): Promise<void>;
    colorPassword(passwordIndex: number, indexes: number[], isValid: boolean): Promise<void>;
}
class PasswordPhilosophyVisualizer implements IPasswordPhilosophyVisualizer {
    private passwords: Array<Drawable & {type: "rectangle"}> = [];
    private indicators: Drawable[] = [];
    private letterSize: number = 0;
    private constants?: ReturnType<typeof constantsBuilder>;
    private printer?: ScreenPrinter;
    constructor(private screenBuilder: ScreenBuilder, private pause: Pause) {
    }

    public async setupPasswords(passwords: string[]): Promise<void> {
        this.constants = constantsBuilder(passwords.length);
        await this.buildScreen();
        if (this.printer) {
            const maxLength = passwords.reduce((acc, next) => Math.max(acc, next.length), 0);
            this.letterSize = this.constants.lineMaxLength / maxLength;
            this.passwords = passwords.map((password, i) => {
                const columnIndex = Math.floor(i / this.constants!.passwordsPerColumn);
                const rowIndex = Math.floor(i % this.constants!.passwordsPerColumn);
                return {
                    color: "white",
                    id: i.toString(),
                    type: "rectangle",
                    c: {
                        x: this.constants!.padding +
                            columnIndex * this.constants!.columnLength,
                        y: rowIndex * (this.constants!.lineHeight + this.constants!.spacing) +
                            this.constants!.padding
                    },
                    size: {
                        x: this.constants!.lineMaxLength * (password.length / maxLength),
                        y: this.constants!.lineHeight
                    }
                };
            });
            this.indicators = passwords.map((password, i) => {
                const columnIndex = Math.floor(i / this.constants!.passwordsPerColumn);
                const rowIndex = Math.floor(i % this.constants!.passwordsPerColumn);
                return {
                    color: "white",
                    id: i.toString() + "-indicator",
                    type: "rectangle",
                    c: {
                        x: this.constants!.padding +
                            (columnIndex + 1) * this.constants!.columnLength -
                            this.constants!.padding - this.constants!.indicatorSize,
                        y: rowIndex * (this.constants!.lineHeight + this.constants!.spacing) +
                            this.constants!.padding
                        },
                    size: {x: this.constants!.indicatorSize, y: this.constants!.lineHeight}
                };

            });
            const drawables = (this.passwords as Drawable[]).concat(this.indicators);
            this.printer.replace(drawables);
            await this.pause(5);
        }
    }
    public async colorPassword(passwordIndex: number, indexes: number[], isValid: boolean): Promise<void> {
        if (this.printer) {
            const drawablePassword = this.passwords[passwordIndex];
            const selectedLetters: Drawable[] = indexes.map((index) => {
                return {
                    type: "rectangle",
                    c: {x: drawablePassword.c.x + index * this.letterSize, y: drawablePassword.c.y },
                    color: isValid ? "lime" : "red",
                    id: `${drawablePassword.id}-letter-${index}`,
                    size: {x: this.letterSize, y: drawablePassword.size.y}
                };
            });
            for (const letter of selectedLetters) {
                this.printer.add(letter);
            }
            this.indicators[passwordIndex].color = isValid ? "lime" : "red";
            await this.pause();
        }
    }

    private async buildScreen() {
        if (this.constants) {
            this.printer = await this.screenBuilder.requireScreen(this.constants.screenSize);
        }
    }
}

class DummyPasswordPhilosophyVisualizer implements IPasswordPhilosophyVisualizer {
    public async setupPasswords(passwords: string[]): Promise<void> {
    }
    public async colorPassword(passwordIndex: number, indexes: number[], isValid: boolean): Promise<void> {
    }

}
