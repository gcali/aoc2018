export function howManySameAtEnd<T>(sequence: T[]): number {
    if (!sequence || sequence.length === 0) {
        return 0;
    }
    let counter = 1;
    const lastElement: T = sequence[sequence.length - 1];
    for (let i = sequence.length - 2; i >= 0; i--) {
        if (lastElement === sequence[i]) {
            counter++;
        } else {
            break;
        }
    }
    return counter;
}

export function groupBy<T>(sequence: T[], n: number): T[][] {
    const result = [];
    let next = [];
    let current = 0;
    for (const e of sequence) {
        next.push(e);
        if (++current === n) {
            result.push(next);
            next = [];
            current = 0;
        }
    }
    return result;
}
