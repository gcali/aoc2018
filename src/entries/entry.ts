import { Choice } from "../constants/choice";
import { Message } from "./entryStatusMessages";

export interface EntryCallbackArg {
    lines: string[];
    outputCallback: ((outputLine: any, shouldClear?: boolean) => Promise<void>);
    pause: (() => Promise<void>);
    statusCallback?: ((outputStatus: Message) => Promise<void>);
    isCancelled?: (() => boolean);
    additionalInputReader?: {
        read: () => Promise<string | null>;
        close: () => void;
    }
}

type OldEntryCallback = (
    lines: string[],
    outputCallback: ((outputLine: any) => Promise<void>),
    statusCallback?: ((outputStatus: Message) => Promise<void>)
) => Promise<void>;

export type OutputCallback = ((outputLine: any, shouldClear?: boolean) => Promise<void>);

type EntryCallback = (arg: EntryCallbackArg) => Promise<void>;

type EntryMetadata = {
    key: string;
    stars?: 1 | 2;
    title: string;
};

export interface Entry {
    first: EntryCallback;
    second: EntryCallback;
    metadata?: EntryMetadata;
}

export function entryForFile(first: EntryCallback, second: EntryCallback, metadata?: EntryMetadata): Entry {
    return {
        first,
        second,
        metadata
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

interface ExecutionArgs {
    entry: Entry;
    choice: Choice;
    lines: string[];
    outputCallback: EntryCallbackArg["outputCallback"];
    isCancelled?: (() => boolean);
    pause?: () => Promise<void>;
    statusCallback?: ((outputStatus: Message) => Promise<void>);
}

export async function executeEntry({
    entry,
    choice,
    lines,
    outputCallback,
    isCancelled,
    pause,
    statusCallback
}: ExecutionArgs
) {
    let callback: EntryCallback;
    if (choice === Choice.first) {
        callback = entry.first;
    } else {
        callback = entry.second;
    }
    await callback({
        lines,
        outputCallback,
        pause: pause || (() => new Promise<void>((resolve) => setTimeout(resolve, 0))),
        isCancelled,
        statusCallback
    });
}
