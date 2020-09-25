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

export function* range(n: number) {
    for (let i = 0; i < n; i++) {
        yield i;
    }
}

export function* subsequenceGenerator<T>(array: T[]): Iterable<T[]> {
    const start = 0;
    const end = array.length;

    for (let s = start; s < end; s++) {
        for (let e = s + 1; e < end; e++) {
            yield array.slice(s, e + 1);
        }
    }
}

export function* subsetGenerator<T>(array: T[], start: number): Iterable<T[]> {
    if (start >= array.length) {
        yield [];
        return;
    }
    for (const sub of subsetGenerator(array, start + 1)) {
        yield sub;
        yield [array[start]].concat(sub);
    }
}

export function* permutationGenerator<T>(array: T[]): Iterable<T[]> {
    if (array.length === 1) {
        yield [array[0]];
    } else {
        for (let i = 0; i < array.length; i++) {
            const startElement = array[i];
            const otherElements = [...array];
            otherElements.splice(i, 1);
            for (const perm of permutationGenerator(otherElements)) {
                yield [startElement].concat(perm);
            }
        }
    }
}


export function* buildGroups<T>(data: T[], size: number, step: number = 1): Iterable<T[]> {
    for (let i = 0; i <= data.length - size; i += step) {
        yield data.slice(i, i + size);
    }
}
