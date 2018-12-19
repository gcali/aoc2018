import * as minimist from 'minimist';

let args = minimist(process.argv.slice(2), {
    alias: { e: "entry", h: "help" },
    string: ["e"],
    boolean: ["help"]
});


let usage =
    `Usage: ${process.argv[1]} [options]

Options:
    -h, --help: print help
    -e, --entry <entry>: [REQUIRED] Identify which entry to run
`;

let error = () => { console.log(usage); process.exit(1); };

if (args["h"]) {
    console.log(usage);
    process.exit(0);
}

if (!("e" in args)) {
    error();
}

let entry: string = args["e"];

import entryMap from "./entries/entry";

if (!(entry in entryMap)) {
    error();
}

entryMap[entry]();