import minimist from "minimist";

const args = (minimist as any)(process.argv.slice(2), {
    alias: { e: "entry", h: "help", s: "second", l: "list" },
    number: ["e"],
    boolean: ["help", "second", "list"],
});


const usage =
    `Usage: ${process.argv[1]} [options]

Options:
    -h, --help: print help
    -e, --entry <entry>: [REQUIRED] Identify which entry to run
    -s, --second: choose second part instead of first
    -l, --list: list entries
`;

const error = () => { console.log(usage); process.exit(1); };

if (args.h) {
    console.log(usage);
    process.exit(0);
}

import { entryList } from "./entries/entryList";

if (args.l) {
    let i = 0;
    for (const entry of entryList) {
        console.log(`${++i} - ${entry.title}`);
    }
    process.exit(0);
}

if (!("e" in args)) {
    error();
}


const index: number = args.e - 1;
if (index <= 0 || index >= entryList.length) {
    error();
}


const entryCallback = entryList[index].entry;


import { readStdin } from "./support/stdin-reader";

readStdin(async (lines) => {
    // tslint:disable-next-line:no-console
    const outputCallback = async (line: string) => console.log(line);
    if (args.s) {
        await entryCallback.second({
            isCancelled: () => false,
            lines,
            outputCallback,
            // tslint:disable-next-line:no-empty
            pause: async () => { }
        }/*, lines, outputCallback*/);
    } else {
        await entryCallback.first({
            lines,
            outputCallback,
            isCancelled: () => false,
            // tslint:disable-next-line:no-empty
            pause: async () => { }
        });
    }
});

