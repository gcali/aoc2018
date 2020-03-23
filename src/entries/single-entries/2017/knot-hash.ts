import { entryForFile } from "../../entry";
import { groupBy } from '../../../support/sequences';

const reverseWrap = (elements: number[], state: State, length: number): number[]  => {
    const startPortionLength = state.currentIndex + length - elements.length;
    const reversePortion = [
        elements.slice(state.currentIndex),
        elements.slice(0, startPortionLength)
    ].flatMap(e => e).reverse();
    return [
        reversePortion.slice(reversePortion.length - startPortionLength),
        elements.slice(startPortionLength, state.currentIndex),
        reversePortion.slice(0, reversePortion.length - startPortionLength)
    ].flatMap(e => e);
}
const reverseSimple = (elements: number[], state: State, length: number): number[]  => {
    return [
        elements.slice(0, state.currentIndex),
        elements.slice(state.currentIndex, state.currentIndex + length).reverse(),
        elements.slice(state.currentIndex + length)
    ].flatMap(e => e);

}

export const reverse = (elements: number[], state: State, length: number): [number[], State] => {
        if (state.currentIndex + length > elements.length) {
            elements = reverseWrap(elements, state, length);
        } else {
            elements = reverseSimple(elements, state, length);
        }
        return [
            elements,
            {
                currentIndex: (state.currentIndex + length + state.skipSize) % elements.length,
                skipSize: (state.skipSize + 1) % elements.length
            }
        ];
}

export const circleGenerator = (n: number = 256): [number[], State] => {
    return [[...Array(n).keys()], {
        currentIndex: 0,
        skipSize: 0
    }];
}

interface State {
    currentIndex: number;
    skipSize: number;
}

export const knotHash = entryForFile(
    async ({ lines, outputCallback }) => {
        const lengths = lines[0].split(",").map(e => parseInt(e, 10));
        let [circle, state]  = circleGenerator();
        lengths.forEach(length => {
            [circle, state] = reverse(circle, state, length);
        });
        await outputCallback(circle[0] * circle[1]);
    },
    async ({ lines, outputCallback }) => {
        const input = lines[0];
        const result = calculateKnotHash(input);
        await outputCallback(result);
    }
)

export function calculateKnotHash(input: string, baseSequence: (number[] | null) = null) {
    if (baseSequence === null) {
        baseSequence = [17, 31, 73, 47, 23];
    }
    const decodedInput = [...input].map(e => e.charCodeAt(0));
    const lengths = decodedInput.concat(baseSequence);
    let [circle, state] = circleGenerator();
    for (let i = 0; i < 64; i++) {
        lengths.forEach(length => {
            [circle, state] = reverse(circle, state, length);
        });
    }
    const result = groupBy(circle, 16)
        .map(group => group.reduce((acc, next) => acc ^ next))
        .map(result => result.toString(16).padStart(2, "0"))
        .join("");
    return result;
}
