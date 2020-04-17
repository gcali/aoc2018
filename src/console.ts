import minimist from "minimist";

const args = (minimist as any)(process.argv.slice(2), {
    alias: { e: "entry", h: "help", s: "second", l: "list", y: "year", n: "noNumber", f: "file"},
    number: ["e", "y"],
    default: {
        "y": null,
        "e": null,
        "n": false,
        "f": null
    },
    string: ["file"],
    boolean: ["help", "second", "list", "noNumber"],
});


const usage =
    `Usage: ${process.argv[1]} [options]

Options:
    -h, --help: print help
    -e, --entry <entry>: Identify which entry to run; if missing, run last entry
    -s, --second: choose second part instead of first
    -l, --list: list entries,
    -y, --year: year,
    -n, --noNumber: hide number in list, optional, default to false
`;

const error = () => { console.log(usage); process.exit(1); };

if (args.h) {
    console.log(usage);
    process.exit(0);
}

import { entryList } from "./entries/entryList";

const getLastYear = (): string => {
    const sorted = Object.keys(entryList).sort();
    return sorted[sorted.length-1];
}

const year: string = args.y === null ? getLastYear() : args.y;

if (args.l) {
    let i = 0;
    for (const entry of entryList[year]) {
        console.log(args.n ? entry.title : `${++i} - ${entry.title}`);
    }
    process.exit(0);
}

const index: number = (args.e === null ? entryList[year].length : args.e) - 1;
if (index <= 0 || index >= entryList[year].length) {
    error();
}


const entryCallback = entryList[year][index].entry;


import { readStdin, Reader, generateFileReader, stdinReadLineByLine } from "./support/stdin-reader";

const isReadingFromFile = args.f !== null && args.f.length > 0;
let reader: Reader | null = null;
let additionalInputReader: undefined | {
    read: () => Promise<string | null>;
    close: () => void;
};
// let additionalReader: undefined | (() => Promise<string>);
// let closer: undefined | (() => void);
if (isReadingFromFile) {
    reader = generateFileReader(args.f);
    const lines: (string | null)[] = [];
    let resolver: ((s: string | null) => void) | null = null;
    const additionalReader = async (): Promise<string | null> => {
        if (lines.length > 0) {
            const first = lines.shift()!;
            return first;
        } else {
            return await new Promise<string | null>((resolve, reject) => resolver = resolve);
        }
    }
    const closer = stdinReadLineByLine(line => {
        if (resolver !== null) {
            const r = resolver;
            resolver = null;
            r(line);
        } else {
            lines.push(line);
        }
    });
    additionalInputReader = {
        close: closer,
        read: additionalReader
    };
} else {
    reader = readStdin;
}

reader(async (lines) => {
    // tslint:disable-next-line:no-console
    const outputCallback = async (line: string) => console.log(line);
    try {
        if (args.s) {
            await entryCallback.second({
                isCancelled: () => false,
                lines,
                outputCallback,
                // tslint:disable-next-line:no-empty
                pause: async () => { },
                additionalInputReader
            }/*, lines, outputCallback*/);
        } else {
            await entryCallback.first({
                lines,
                outputCallback,
                isCancelled: () => false,
                // tslint:disable-next-line:no-empty
                pause: async () => { },
                additionalInputReader
            });
        }
    } finally {
        if (additionalInputReader) {
            additionalInputReader.close();
        }
    }
});

