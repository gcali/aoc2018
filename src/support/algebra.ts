export const modInverse = (n: number, mod: number): number => {
    const {a, b} = calculateExtended(n, mod, 1);
    return a > 0 ? a : a + mod;
}

const calculateExtended = (aP: number, bP: number, m: number): {
    a: number,
    b: number
} => {
    let a = {
        n: aP,
        a: 1,
        b: 0
    };
    let b = {
        n: bP,
        a: 0,
        b: 1
    };

    while (!(m % b.n === 0)) {
        const f = Math.floor(a.n / b.n);
        const q = {
            n: a.n % b.n,
            a: a.a - (f * b.a),
            b: a.b - (f * b.b)
        };
        a = b;
        b = q;
    }

    const factor = m / b.n;
    const result = {
        a: b.a * factor,
        b: b.b * factor
    };
    if (result.a * aP + result.b * bP !== m) {
        throw new Error("Inversion did not work");
    }
    return result;
}

type ExtendedEuclidFactor = {
    n: number,
    a: number,
    b: number
};