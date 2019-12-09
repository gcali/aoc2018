import { Choice } from "../constants/choice";

export interface EntryCallbackArg {
    lines: string[];
    outputCallback: ((outputLine: any, shouldClear?: boolean) => Promise<void>);
    pause: (() => Promise<void>);
    statusCallback?: ((outputStatus: any) => Promise<void>);
    isCancelled?: (() => boolean);
}

type OldEntryCallback = (
    lines: string[],
    outputCallback: ((outputLine: any) => Promise<void>),
    statusCallback?: ((outputStatus: any) => Promise<void>)
) => Promise<void>;

export type OutputCallback = ((outputLine: any, shouldClear?: boolean) => Promise<void>);

type EntryCallback = (arg: EntryCallbackArg) => Promise<void>;

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
export function oldEntryForFile(first: OldEntryCallback, second: OldEntryCallback): Entry {
    return {
        first: (args: EntryCallbackArg) => (first(args.lines, args.outputCallback, args.statusCallback)),
        second: (args: EntryCallbackArg) => (second(args.lines, args.outputCallback, args.statusCallback))
    };
}

export interface EntryFileHandling {
    choice: Choice;
    content: string[];
}

export function simpleOutputCallbackFactory(output: string[]) {
    return (outputLine: any, shouldClear?: boolean): Promise<void> => {
        if (shouldClear) {
            output.length = 0;
        }

        if (outputLine === null) {
            output.length = 0;
        } else if (typeof (outputLine) === "string") {
            output.push(outputLine);
        } else if (Array.isArray(outputLine)) {
            output.push(outputLine.join("\n"));
        } else {
            output.push(JSON.stringify(outputLine, undefined, 4));
        }
        return new Promise<void>((resolve) => setTimeout(resolve, 0));
    };
}

export async function executeEntry(
    entry: Entry,
    choice: Choice,
    lines: string[],
    outputCallback: EntryCallbackArg["outputCallback"],
    isCancelled?: (() => boolean)
) {
    let callback: EntryCallback;
    if (choice === Choice.first) {
        callback = entry.first;
    } else {
        callback = entry.second;
    }
    console.log(entry);
    await callback({
        lines,
        outputCallback,
        pause: () => new Promise<void>((resolve) => setTimeout(() => {
            resolve();
        }, 0)),
        isCancelled

    });
}
