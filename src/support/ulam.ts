import { Coordinate } from './geometry';

export class UlamCalculator {
    public getCoordinatesFromValue(v: number): Coordinate { 
        if (v === 1) {
            return {x: 0, y: 0};
        }
        const size = this.findSquareSize(v);
        const sideDistance = Math.floor(size/2);
        const min = (size - 1)**2;
        const max = size**2;
        const isDown = v > max - size;
        const sideCalculators = [
            {
                delta: -size,
                x: (v: number, middle: number) => v - middle,
                y: (v: number, middle: number) => -sideDistance
            },
            {
                delta: -2*(size-1) - 1,
                x: (v: number, middle: number) => -sideDistance,
                y: (v: number, middle: number) => middle - v
            },
            {
                delta: -3*(size-1) - 1,
                x: (v: number, middle: number) => middle - v,
                y: (v: number, middle: number) => sideDistance
            },
            {
                delta: -4*(size-1) - 1,
                x: (v: number, middle: number) => sideDistance,
                y: (v: number, middle: number) => v - middle
            }
        ];

        for (const calc of sideCalculators) {
            const currentMax = max + calc.delta + size;
            if (v > max + calc.delta) {
                const middlePoint = this.findSideMiddlePoint(size, currentMax);
                return {
                    x: calc.x(v, middlePoint),
                    y: calc.y(v, middlePoint)
                };
            }
        }
        throw new Error(`Cannot calculate for ${v} :(`);
    }

    public findSideMiddlePoint(size: number, max: number) {
        const min = max - size + 1;
        return (max + min)/2
    }

    public findSquareSize(v: number): number {
        const root = Math.sqrt(v);
        const ceil = Math.ceil(root);
        return ceil % 2 === 0 ? ceil + 1 : ceil;
    }
}