import * as bigintCryptoUtils from "bigint-crypto-utils";

export const modInverse = (n: bigint, mod: bigint): bigint => {
    return bigintCryptoUtils.modInv(n, mod);
    // const {a, b} = calculateExtended(n, mod, 1);
    // return a > 0 ? a : a + mod;
};

export const pow = (n: bigint, exp: bigint, mod: bigint): bigint => {
    return bigintCryptoUtils.modPow(n, exp, mod);
};

export const factorial = (n: number): number => {
    let res = n;
    while (n-- > 1) {
        res *= n;
    }
    return res;
};

export const logarithm = (base: number, target: number): number => {
  return Math.log(base) / Math.log(target);
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
        throw new Error("Inversion did not work: " + JSON.stringify({...result, factor}));
    }
    return result;
};

interface ExtendedEuclidFactor {
    n: number;
    a: number;
    b: number;
}
