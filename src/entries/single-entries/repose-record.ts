import { entryForFile } from "../entry";
import Best from "../../support/best";
import { warn } from "@/support/log";

class GuardSleep {
    public id: number;
    public from: number | null = null;
    public to: number | null = null;
    constructor(guardID: number) {
        this.id = guardID;
    }

    public get howMuch(): number {
        if (this.from === null || this.to === null) {
            throw Error("From or to were null");
        }
        return this.to - this.from;
    }

    public isSleepingInMinute(minute: number) {
        if (this.from === null || this.to === null) {
            throw Error("From or to were null");
        }
        return this.from <= minute && this.to > minute;
    }


}
class LogDate {
    public minutes: number;
    private dateText: string;
    constructor(line: string) {
        const dateLastIndex = line.indexOf("]");
        const dateText = line.slice(1, dateLastIndex);
        this.dateText = dateText;
        this.minutes = parseInt(this.dateText.split(":")[1], 10);
    }
    public compare(other: LogDate): number {
        return this.dateText.localeCompare(other.dateText);
    }

    public toString(): string {
        return this.dateText;
    }
}
class LogEntry {
    public guardID: number | null = null;
    public wakes: boolean = false;
    public fallsAsleep: boolean = false;
    public dateToken: LogDate;

    constructor(line: string) {
        this.dateToken = new LogDate(line);
        if (line.includes("wakes")) {
            this.wakes = true;
        } else if (line.includes("asleep")) {
            this.fallsAsleep = true;
        } else {
            const idStartIndex = line.indexOf("#") + 1;
            const idEndIndex = line.slice(idStartIndex).indexOf(" ");
            const sliced = line.slice(idStartIndex, idStartIndex + idEndIndex + 1);
            this.guardID = parseInt(sliced, 10);
        }
    }

    public toString(): string {
        let post: string;
        if (this.wakes) {
            post = "+";
        } else if (this.fallsAsleep) {
            post = "-";
        } else {
            post = "" + this.guardID;
        }
        return `${this.dateToken} - ${post}`;
    }

    public compare(other: LogEntry) {
        return this.dateToken.compare(other.dateToken);
    }
}

export const entry = entryForFile(
    (lines, outputCallback) => {
        const guardSleeps: {
            [key: number]: GuardSleep[];
        } = parseSleeps(lines);

        let currentMax: [number, GuardSleep[]] | null = null;
        for (const guardIDKey of Object.keys(guardSleeps)) {
            const nestedGuardID = parseInt(guardIDKey, 10);
            const sleeps = guardSleeps[nestedGuardID];
            const totalSleep = sleeps.map((s) => s.howMuch).reduce((acc, curr) => acc + curr);
            if (!currentMax || totalSleep > currentMax[0]) {
                currentMax = [totalSleep, sleeps];
            }
        }

        let bestMinute: [number, number] | null = null;

        if (!currentMax) {
            throw Error("No current max found");
        }
        for (let i = 0; i < 60; i++) {
            const sleeps = currentMax[1];
            const howManyIntervals = sleeps.filter((interval) => interval.isSleepingInMinute(i)).length;
            if (!bestMinute || howManyIntervals > bestMinute[0]) {
                bestMinute = [howManyIntervals, i];
            }
        }
        const mostSleepingMinute = bestMinute![1];
        const guardID = currentMax[1][0].id;
        outputCallback("" + mostSleepingMinute * guardID);

    },
    (lines, outputCallback) => {
        const guardSleeps = parseSleeps(lines);
        const totalMaxSleep = new Best<number>();
        for (const guardIDKey of Object.keys(guardSleeps)) {
            const guardID = parseInt(guardIDKey, 10);
            const maxSleep = new Best<number>();
            const sleeps = guardSleeps[guardID];
            for (let i = 0; i < 60; i++) {
                const howMany = sleeps.filter((interval) => interval.isSleepingInMinute(i)).length;
                maxSleep.add({ key: howMany, value: i });
            }
            totalMaxSleep.add({
                key: maxSleep.currentBest!.key,
                value: guardID * maxSleep.currentBest!.value,
            });
        }
        outputCallback("" + totalMaxSleep.currentBest!.value);

    },
);

function parseSleeps(lines: string[]) {
    const entries = lines.map((l) => new LogEntry(l)).sort((a, b) => a.compare(b));
    let isAsleep = false;
    // sanity check
    entries.forEach((e) => {
        if (e.wakes) {
            if (!isAsleep) {
                warn("Was not sleeping!");
            }
            isAsleep = false;
        } else if (e.fallsAsleep) {
            if (isAsleep) {
                warn("Was already sleeping");
            }
            isAsleep = true;
        }
    });
    const guardSleeps: {
        [key: number]: GuardSleep[];
    } = {};
    let currentGuardSleep: GuardSleep;
    entries.forEach((e) => {
        if (e.guardID) {
            currentGuardSleep = new GuardSleep(e.guardID);
        } else if (e.fallsAsleep) {
            currentGuardSleep.from = e.dateToken.minutes;
        } else if (e.wakes) {
            currentGuardSleep.to = e.dateToken.minutes;
            if (!(currentGuardSleep.id in guardSleeps)) {
                guardSleeps[currentGuardSleep.id] = [];
            }
            guardSleeps[currentGuardSleep.id].push(currentGuardSleep);
            currentGuardSleep = new GuardSleep(currentGuardSleep.id);
        }
    });
    return guardSleeps;
}
