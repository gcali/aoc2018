import { entryForFile } from "../../entry";
import { setTimeoutAsync, mapAsync } from "../../../support/async";

interface Element {
    name: string;
    amount: number;
}

interface Chain {
    target: Element;
    needs: Element[];
}

function serializeElement(e: Element): string {
    return `${e.amount} ${e.name}`;
}

function serializeChain(c: Chain): string {
    return `${c.needs.map(serializeElement).join(", ")} => ${serializeElement(c.target)}`;
}

function serializeChains(c: Chain[]): string {
    return c.map(serializeChain).join("\n");
}

function parseElement(raw: string): Element {
    const [amount, name] = raw.trim().split(" ");
    return { amount: parseInt(amount, 10), name };
}

function parseLine(line: string): Chain {
    const [left, right] = line.split("=>").map((e) => e.trim());

    const needs = left.split(",").map((e) => e.trim()).map(parseElement);
    const target = parseElement(right);
    return { needs, target };
}

function parseLines(lines: string[]): Chain[] {
    return lines.filter((l) => !l.startsWith("--")).map((l) => l.trim()).filter((l) => l.length > 0).map(parseLine);
}

const targetName = "FUEL";
const baseName = "ORE";

interface OrePrice {
    toCreate: number;
    youNeed: number;
}

interface CalculatedPrices { [key: string]: OrePrice; }

class Remaining {
    private readonly _remainingMap: { [key: string]: number } = {};

    public add(e: Element) {
        this.ensure(e.name);
        this._remainingMap[e.name] += e.amount;
    }

    public askFor(e: Element): number {
        this.ensure(e.name);
        const howManyCanTake = Math.min(this._remainingMap[e.name], e.amount);
        this._remainingMap[e.name] -= howManyCanTake;
        return howManyCanTake;
    }

    private ensure(k: string) {
        if (!this._remainingMap[k]) {
            this._remainingMap[k] = 0;
        }
    }
}

let i = 0;

async function oreRequirement(target: Element, c: Chain[], r: Remaining, d?: Debug): Promise<OrePrice> {
    i++;
    const closed = i;
    const log = async (s: any) => {
        const intLog = (d && d.log) || (async () => { });
        if (closed === 1) {
            await intLog("ID: " + closed);
            await intLog(s);
        }
    };
    await log("Trying to build:");
    await log(target);
    if (target.name === baseName) {
        await log("Trying to build ore, done with requirements:");
        const res = { toCreate: target.amount, youNeed: target.amount };
        await log(res);
        return res;
    }
    await log("Trying with remainings");
    await log((r as any)._remainingMap);
    const howManyRequired = target.amount - r.askFor(target);
    if (howManyRequired === 0) {
        await log("Everything found in remaining");
        return {
            toCreate: target.amount,
            youNeed: 0
        };
    }
    await log("Only some found in remaining, new required:");
    await log(howManyRequired);
    await log("New remaining:");
    await log((r as any)._remainingMap);
    const chain = c.filter((e) => e.target.name === target.name)[0];
    const howManyNeedToBuild = Math.ceil(howManyRequired / chain.target.amount);
    await log(`Recipe says how to build ${chain.target.amount}, need ${howManyRequired}, building ${howManyNeedToBuild}`);
    const needs = chain.needs.map((n) => ({ name: n.name, amount: n.amount * howManyNeedToBuild }));
    await log(`New needs:`);
    await log(JSON.stringify(needs));
    const prices = await mapAsync(needs, async (n) => ({ price: await oreRequirement(n, c, r, d), element: n }));
    // prices.forEach((p) => {
    //     if (p.price.toCreate > p.element.amount) {
    //         r.add({ name: p.element.name, amount: p.price.toCreate - p.element.amount });
    //     }
    // });
    r.add({ name: target.name, amount: howManyNeedToBuild * chain.target.amount - howManyRequired });
    await log("Updated remaining:");
    await log((r as any)._remainingMap);
    const finalResult = {
        toCreate: target.amount,
        youNeed: prices.map((p) => p.price.youNeed).reduce((a, b) => a + b)
    };
    await log("Final result:");
    await log(finalResult);
    return finalResult;
}


interface Debug {
    pause?: () => Promise<void>;
    log?: (s: any) => Promise<void>;
}

export const spaceStoichiometry = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const chains = parseLines(lines);
        await outputCallback(serializeChains(chains));
        // const amount = await getPrice(targetName, chains, { log: outputCallback, pause: pause });
        const remain = new Remaining();
        // const amount = await oreRequirement(chains.filter((e) => e.target.name === targetName)[0].target, chains, remain, { log: outputCallback, pause });
        const amount = await oreRequirement(chains.filter((e) => e.target.name === targetName)[0].target, chains, remain);
        await outputCallback(amount);
        await outputCallback("Remaining:");
        await outputCallback((remain as any)._remainingMap);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const chains = parseLines(lines);
        let current: number = 0;
        let targetAmount = 1;
        const storageOres = 1000000000000;
        const target = chains.filter((e) => e.target.name === targetName)[0].target;
        while (current < storageOres) {
            targetAmount *= 2;
            const newTarget = { ...target, amount: targetAmount };
            current = (await oreRequirement(newTarget, chains, new Remaining())).youNeed;
            await outputCallback("Current guess:");
            await outputCallback({ targetAmount, current });
        }
        let under = Math.floor(targetAmount / 2);
        let over = targetAmount;
        let guess = Math.floor((under + over) / 2);
        while (under < over) {
            // target.amount = guess;
            const newTarget = { ...target, amount: guess };
            const needed = (await oreRequirement(newTarget, chains, new Remaining())).youNeed;
            if (needed === storageOres) {
                break;
            } else if (needed > storageOres) {
                over = guess;
            } else if (needed < storageOres) {
                under = guess;
            }
            guess = Math.floor((under + over) / 2);
            await outputCallback("New status:");
            await outputCallback({ under, over, guess });
            if (guess === under) {
                break;
            }
        }
        await outputCallback("You can create " + guess);
        // const amount = await oreRequirement(target, chains, remain);
        // await outputCallback(amount);
        // await outputCallback("Remaining:");
        // await outputCallback((remain as any)._remainingMap);
    }
);
