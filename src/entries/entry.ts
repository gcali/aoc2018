type EntryCallback = (lines: string[], outputCallback: ((outputLine: string) => void)) => void;

export interface Entry {
    first: EntryCallback;
    second: EntryCallback;
}

export function entryForFile(first: EntryCallback, second: EntryCallback): Entry {
    return {
        first,
        second
    };
}
