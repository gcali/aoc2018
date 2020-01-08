export interface BestArg<T, U> {
    key: T;
    value: U;
}

type Comparator<T> = (a: T, b: T) => number;

export const maxNumber: Comparator<number> = (a, b) => a - b;
export const minNumber: Comparator<number> = (a, b) => maxNumber(a, b) * -1;

export const ascending = maxNumber;
export const descending = minNumber;


export class CustomBest<T, U> {
    public currentBest: BestArg<T, U> | null = null;
    constructor(private comparator: Comparator<T>) {
    }
    public add(e: BestArg<T, U>) {
        if ((this.currentBest === null) || this.comparator(this.currentBest.key, e.key) < 0) {
            this.currentBest = e;
        }
    }
}

export default class Best<U> extends CustomBest<number, U> {
    constructor() {
        super((a, b) => a - b);
    }
}

export class SimpleBest<T> {
    public currentBest: T | null = null;

    constructor(private comparator: Comparator<T>) {
    }

    public add(e: T) {
        if ((this.currentBest === null) || this.comparator(this.currentBest, e) < 0) {
            this.currentBest = e;
        }
    }
}
