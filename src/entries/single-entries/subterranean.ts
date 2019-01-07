import { entryForFile } from "../entry";
import { DoubleLinkedNode } from "@/support/data-structure";

enum PlantStatus {
    full = "#",
    empty = "."
}

function toPlantStatus(s: string) {
    if (s === "#") {
        return PlantStatus.full;
    } else {
        return PlantStatus.empty;
    }
}

interface Pattern {
    pattern: PlantStatus[];
    result: PlantStatus;
}

class Greenhouse {
    private startIndex: number;
    private start: DoubleLinkedNode<PlantStatus> | null = null;
    private end: DoubleLinkedNode<PlantStatus> | null = null;

    constructor(initialStatus: PlantStatus[], private patterns: Pattern[]) {
        this.startIndex = 0;
        initialStatus.forEach((s) => {
            if (this.start === null) {
                this.start = new DoubleLinkedNode<PlantStatus>(s);
                this.end = this.start;
            } else {
                this.end = this.end!.append(s);
            }
        });
        this.fixEmptyPots();
    }

    public get status() {
        return {
            status: this.start!.visitToRight(),
            startIndex: this.startIndex
        };
    }

    public passGeneration() {
        let e = this.start;
        while (e !== null) {
            const nextFour = e.visitToRight(4);
            if (nextFour.length !== 4) {
                break;
            }
            this.patterns.some((p) => {
                let foundDifferent: boolean = false;
                for (let i = 0; i < 4; i++) {
                    if (p.pattern[i] !== nextFour[i]) {
                        foundDifferent = true;
                        break;
                    }
                }
                if (foundDifferent) {
                    return false;
                } else {
                    e!.value = p.result;
                    return true;
                }
            });
            e = e.next;
        }
        this.fixEmptyPots();
    }

    public toString(): string {
        if (this.start === null) {
            return "empty";
        } else {
            return `${this.start.visitToRight().join("")} ${this.startIndex}`;
        }
    }

    public fixEmptyPots() {
        const emptyBufferSize = 3;
        let consecutiveEmptyPots = 0;
        let e = this.start;
        while (e !== null && e.value === PlantStatus.empty) {
            consecutiveEmptyPots++;
            e = e.next;
        }
        while (consecutiveEmptyPots < emptyBufferSize) {
            this.start = this.start!.prepend(PlantStatus.empty);
            this.startIndex--;
            consecutiveEmptyPots++;
        }
        while (consecutiveEmptyPots > emptyBufferSize) {
            this.start!.removeNext();
            this.startIndex++;
            consecutiveEmptyPots--;
        }

        consecutiveEmptyPots = 0;
        e = this.end;
        while (e !== null && e.value === PlantStatus.empty) {
            consecutiveEmptyPots++;
            e = e.prev;
        }
        while (consecutiveEmptyPots < emptyBufferSize) {
            this.end = this.end!.append(PlantStatus.empty);
            consecutiveEmptyPots++;
        }
        while (consecutiveEmptyPots > emptyBufferSize) {
            this.end!.removePrev();
            consecutiveEmptyPots--;
        }
    }
}

export const entry = entryForFile(
    (lines, outputCallback) => {
        const initialState = lines[0]
            .slice(lines[0].indexOf(":") + 2)
            .trim()
            .split("")
            .map((e) => e === "#" ? PlantStatus.full : PlantStatus.empty);

        const patterns: Pattern[] = lines
            .slice(2)
            .map((l) => l.trim())
            .filter((l) => l.indexOf(">") > 0)
            .map((l) => l.replace(/ /g, "").replace(/>/g, "").split("="))
            .map((couple) => ({
                result: toPlantStatus(couple[1]),
                pattern: couple[0].split("").map((p) => toPlantStatus(p))
            }));
        // outputCallback(patterns.map((p) => `${p.pattern.join("")} => ${p.result}`).join("\n"));
        const greenhouse = new Greenhouse(initialState, patterns);
        for (let i = 0; i < 20; i++) {
            greenhouse.passGeneration();
        }
        const status = greenhouse.status;
        const filled = status
            .status
            .map((e, index) => ({
                index: index + status.startIndex,
                value: e
            }))
            .filter((e) => e.value === PlantStatus.full)
            .map((e) => e.index);
        const sum = filled.reduce((acc, next) => acc + next);
        outputCallback(sum);
    },
    (lines, outputCallback) => {
        throw Error("Not implemented yet");
    }
);
