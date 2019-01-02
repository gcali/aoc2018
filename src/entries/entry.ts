import readLines from '../support/file-reader';

export default interface Entry {
    first(): void;
    second(): void;
}

type EntryCallback = (lines: string[]) => void;
export const entryForFile = (first: EntryCallback, second: EntryCallback): Entry => {
    return {
        first: () => readLines(first),
        second: () => readLines(second),
    };
};

// export function entryForFile
