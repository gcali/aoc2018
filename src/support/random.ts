export const randrange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomCharacter = (): string => {
    const min = "a".charCodeAt(0);
    const max = "z".charCodeAt(0);
    return String.fromCharCode(randrange(min, max));
};
