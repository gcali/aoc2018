import { Choice } from "@/constants/choice";

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

export interface EntryFileHandling {
    choice: Choice;
    content: string[];
}

export function executeEntry(entry: Entry, choice: Choice, lines: string[], output: string[]) {
    let callback: EntryCallback;
    if (choice === Choice.first) {
        callback = entry.first;
    } else {
        callback = entry.second;
    }
    callback(lines, (outputLine) => {
        output.push(outputLine);
    });
}
