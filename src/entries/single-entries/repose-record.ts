import { entryForFile } from "../entry";
import Best from "../../support/best";

class GuardSleep {
    id: number;
    public from: number;
    public to: number;
    constructor(guardID: number) {
        this.id = guardID;
    }

    public get howMuch(): number {
        return this.to - this.from;
    }

    public isSleepingInMinute(minute: number) {
        return this.from <= minute && this.to > minute;
    }


}
class LogDate {
    private dateText: string;
    public minutes: number;
    constructor(line: string) {
        let dateLastIndex = line.indexOf("]");
        let dateText = line.slice(1, dateLastIndex);
        this.dateText = dateText;
        this.minutes = parseInt(this.dateText.split(":")[1]);
    }
    public compare(other: LogDate): number {
        return this.dateText.localeCompare(other.dateText);
    }

    public toString(): string {
        return this.dateText;
    }
}
class LogEntry {
    public guardID?: number = null;
    public wakes: boolean = false;
    public fallsAsleep: boolean = false;
    public dateToken: LogDate;

    constructor(line: string) {
        this.dateToken = new LogDate(line);
        if (line.includes("wakes")) {
            this.wakes = true;
        }
        else if (line.includes("asleep")) {
            this.fallsAsleep = true;
        }
        else {
            let idStartIndex = line.indexOf("#") + 1;
            let idEndIndex = line.slice(idStartIndex).indexOf(" ");
            let sliced = line.slice(idStartIndex, idStartIndex + idEndIndex + 1);
            this.guardID = parseInt(sliced);
        }
    }

    public toString(): string {
        let post: string = undefined;
        if (this.wakes) {
            post = "+";
        }
        else if (this.fallsAsleep) {
            post = "-";
        }
        else {
            post = "" + this.guardID;
        }
        return `${this.dateToken} - ${post}`
    };

    public compare(other: LogEntry) {
        return this.dateToken.compare(other.dateToken);
    }
}

const entry = entryForFile(
    lines => {
        let guardSleeps: {
            [key: number]: GuardSleep[];
        } = parseSleeps(lines);

        let currentMax: [number, GuardSleep[]];
        for (let guardID in guardSleeps) {
            let sleeps = guardSleeps[guardID];
            let totalSleep = sleeps.map(s => s.howMuch).reduce((acc, curr) => acc + curr);
            if (!currentMax || totalSleep > currentMax[0]) {
                currentMax = [totalSleep, sleeps];
            }
        }

        let bestMinute: [number, number];

        for (let i = 0; i < 60; i++) {
            let sleeps = currentMax[1];
            let howManyIntervals = sleeps.filter(interval => interval.isSleepingInMinute(i)).length;
            if (!bestMinute || howManyIntervals > bestMinute[0]) {
                bestMinute = [howManyIntervals, i];
            }
        }
        let mostSleepingMinute = bestMinute[1];
        let guardID = currentMax[1][0].id;
        console.log(mostSleepingMinute * guardID);

    },
    lines => {
        let guardSleeps = parseSleeps(lines);
        let totalMaxSleep = new Best<number>();
        for (let guardID in guardSleeps) {
            let maxSleep = new Best<number>();
            let sleeps = guardSleeps[guardID];
            for (let i = 0; i < 60; i++) {
                let howMany = sleeps.filter(interval => interval.isSleepingInMinute(i)).length;
                maxSleep.add({ key: howMany, value: i });
            }
            totalMaxSleep.add({
                key: maxSleep.currentBest.key,
                value: parseInt(guardID) * maxSleep.currentBest.value
            });
        }
        console.log(totalMaxSleep.currentBest);

    }
);

export default entry;

function parseSleeps(lines: string[]) {
    let entries = lines.map(l => new LogEntry(l)).sort((a, b) => a.compare(b));
    let isAsleep = false;
    //sanity check
    entries.forEach(e => {
        if (e.wakes) {
            if (!isAsleep) {
                console.warn("Was not sleeping!");
            }
            isAsleep = false;
        }
        else if (e.fallsAsleep) {
            if (isAsleep) {
                console.warn("Was already sleeping");
            }
            isAsleep = true;
        }
    });
    let guardSleeps: {
        [key: number]: GuardSleep[];
    } = {};
    let currentGuardSleep: GuardSleep;
    entries.forEach(e => {
        if (e.guardID) {
            currentGuardSleep = new GuardSleep(e.guardID);
        }
        else if (e.fallsAsleep) {
            currentGuardSleep.from = e.dateToken.minutes;
        }
        else if (e.wakes) {
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
