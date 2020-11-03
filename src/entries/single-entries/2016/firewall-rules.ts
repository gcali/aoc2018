import { entryForFile } from "../../entry";

type Range = {
    start: number;
    end: number;
}

class Ranges {
    private _ranges: Range[] = [];
    public addRange(start: number, end: number): Ranges {
        this._ranges.push({start,end});
        this.mergeRanges();
        return this;
    }

    public addRanges(ranges: Range[]): Ranges {
        this._ranges = this._ranges.concat(ranges);
        this.mergeRanges();
        return this;
    }

    private mergeRanges() {
        this._ranges.sort((a,b) => a.start - b.start);
        for (let i = 0; i < this._ranges.length - 1; i++) {
            if (this._ranges[i].end >= this._ranges[i+1].start-1) {
                this._ranges[i+1].start = Math.min(this._ranges[i].start, this._ranges[i+1].start);
                this._ranges[i+1].end = Math.max(this._ranges[i].end, this._ranges[i+1].end);
                this._ranges[i].start = -1;
            }
        }
        this._ranges = this._ranges.filter(e => e.start >= 0);
    }

    public get ranges() {
        return this._ranges.map(e => ({...e}));
    }

    public get length() {
        return this._ranges.length;
    }
}

const parseLines = (lines: string[]): Ranges => {
    return new Ranges().addRanges(lines.map(line => {
        const [a,b] = line.split("-").map(e => parseInt(e, 10));
        return {start: a, end: b};
    }))
}

export const firewallRules = entryForFile(
    async ({ lines, outputCallback }) => {
        const ranges = parseLines(lines);

        await outputCallback(`${ranges.length}/${lines.length}`);
        const firstRange = ranges.ranges[0];
        await outputCallback("First free ip: ");
        if (firstRange.start !== 0) {
            await outputCallback(0);
        } else {
            await outputCallback(firstRange.end+1);
        }
    },
    async ({ lines, outputCallback }) => {
        const ranges = parseLines(lines);
        const minValue = 0;
        const maxValue = 2**32 - 1;

        let nextCandidate = minValue;
        let result = 0;
        for (const range of ranges.ranges) {
            const delta = range.start - nextCandidate;
            result += delta;
            nextCandidate = range.end + 1;
        }
        result += maxValue - nextCandidate + 1;
        await outputCallback(result);
    },
    { key: "firewall-rules", title: "Firewall Rules", stars: 2}
);