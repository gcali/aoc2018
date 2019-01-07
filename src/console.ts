import minimist from "minimist";

const args = (minimist as any)(process.argv.slice(2), {
    alias: { e: "entry", h: "help", s: "second" },
    string: ["e"],
    boolean: ["help", "second"],
});


const usage =
    `Usage: ${process.argv[1]} [options]

Options:
    -h, --help: print help
    -e, --entry <entry>: [REQUIRED] Identify which entry to run,
    -s, --second: choose second part instead of first
`;

const error = () => { console.log(usage); process.exit(1); };

if (args.h) {
    // console.log(usage);
    process.exit(0);
}

if (!("e" in args)) {
    error();
}

// const entry: string = args.e;

// import entryMap from "./entries/entryMap";

// if (!(entry in entryMap)) {
//     error();
// }

// const entryCallback = entryMap[entry];

import { entry as entryCallback } from "./entries/single-entries/the-stars-align";
import { readStdin } from "./support/stdin-reader";

readStdin((lines) => {
    // tslint:disable-next-line:no-console
    const outputCallback = (line: string) => console.log(line);
    if (args.s) {
        entryCallback.second(lines, outputCallback);
    } else {
        entryCallback.first(lines, outputCallback);
    }
});

