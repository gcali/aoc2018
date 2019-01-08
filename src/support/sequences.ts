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
