import * as minimist from 'minimist';

let args = minimist(process.argv.slice(2), {
    alias: { e: "entry", h: "help", s: "second" },
    string: ["e"],
    boolean: ["help", "second"]
});


let usage =
    `Usage: ${process.argv[1]} [options]

Options:
    -h, --help: print help
    -e, --entry <entry>: [REQUIRED] Identify which entry to run,
    -s, --second: choose second part instead of first
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

import entryMap from "./entries/entryMap";

if (!(entry in entryMap)) {
    error();
}

if (args["s"]) {
    entryMap[entry].second();
}
else {
    entryMap[entry].first();
}