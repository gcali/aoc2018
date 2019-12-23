import { entryForFile } from "../entry";
import { setTimeoutAsync, mapAsync } from '../../support/async';

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
    const [left, right] = line.split("=>").map(e => e.trim());

    const needs = left.split(",").map(e => e.trim()).map(parseElement);
    const target = parseElement(right);
    return { needs, target };
}

function parseLines(lines: string[]): Chain[] {
    return lines.filter(l => !l.startsWith("--")).map(l => l.trim()).filter(l => l.length > 0).map(parseLine);
}

const targetName = "FUEL";
const baseName = "ORE";

interface OrePrice {
    toCreate: number;
    youNeed: number;
}

type CalculatedPrices = { [key: string]: OrePrice };

class Remaining {
    private readonly _remainingMap: { [key: string]: number } = {};

    public add(e: Element) {
        this.ensure(e.name);
        this._remainingMap[e.name] += e.amount;
    }

    public askFor(e: Element): number {
        this.ensure(e.name);
        const howManyCanTake = Math.max(this._remainingMap[e.name] - e.amount, 0);
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
        await intLog("ID: " + closed);
        await intLog(s);
    };
    await log("Trying to build:")
    await log(target)
    if (target.name === baseName) {
        await log("Trying to ore, done with requirements:")
        const res = { toCreate: target.amount, youNeed: target.amount };
        await log(res)
        return res;
    }
    const howManyRequired = target.amount - r.askFor(target);
    if (howManyRequired === 0) {
        await log("Everything found in remaining")
        return {
            toCreate: target.amount,
            youNeed: 0
        };
    }
    await log("Only some found in remaining, new required:")
    await log(howManyRequired);
    const chain = c.filter(e => e.target.name === target.name)[0];
    const howManyNeedToBuild = Math.ceil(howManyRequired / chain.target.amount);
    await log(`Recipe says how to build ${chain.target.amount}, need ${howManyRequired}, building ${howManyNeedToBuild}`);
    const needs = chain.needs.map(n => ({ name: n.name, amount: n.amount * howManyNeedToBuild }));
    await log(`New needs:`);
    await log(needs);
    const prices = await mapAsync(needs, async n => ({ price: await oreRequirement(n, c, r, d), element: n }));
    prices.forEach(p => {
        if (p.price.toCreate > p.element.amount) {
            r.add({ name: p.element.name, amount: p.price.toCreate - p.element.amount });
        }
    });
    const finalResult = {
        toCreate: target.amount,
        youNeed: prices.map(p => p.price.youNeed).reduce((a, b) => a + b)
    };
    await log("Final result:");
    await log(finalResult);
    return finalResult;
}


function basePriceGenerator(): CalculatedPrices {
    const d: CalculatedPrices = {};
    d[baseName] = { toCreate: 1, youNeed: 1 };
    return d;
}

function findRequirements(e: Element, c: Chain[]): Element[] {
    if (e.name === baseName) {
        return [e];
    } else {
        const target = c.filter(e => e.target.name === e.target.name)[0];
        const needs = target.needs;
        const coeff = Math.ceil(e.amount / target.target.amount);
        const newNeeds: Element[] = needs.map(innerE => ({ name: innerE.name, amount: innerE.amount * coeff }));
        return newNeeds;
    }
}

interface Debug {
    pause?: () => Promise<void>;
    log?: (s: any) => Promise<void>;
}

async function getPrice(target: string, c: Chain[], d?: Debug): Promise<number> {
    const targetChain = c.filter(e => e.target.name === target)[0];
    let needs = targetChain.needs;
    if (targetChain.target.amount > 1) {
        needs.map(n => ({ name: n.name, amount: n.amount * targetChain.target.amount }));
    }
    console.log("Needs:", needs);
    if (d && d.log) {
        await d.log(needs.map(n => n.name).join(" "));
        await setTimeoutAsync(1000);
    }
    while (needs.length > 1 && needs[0].name !== baseName) {
        needs = needs
            .flatMap(n => findRequirements(n, c));
        if (d && d.log) {
            await d.log(needs.map(n => n.name).join(" "));
            await setTimeoutAsync(1000);
        } else if (d && d.pause) {
            await d.pause();
        }
        const groups: { [key: string]: Element[] } = {};
        needs.forEach(e => {
            if (groups[e.name]) {
                groups[e.name].push(e);
            } else {
                groups[e.name] = [e];
            }
        });
        needs = Object.values(groups).map(e => e.reduce((a, b) => ({ name: a.name, amount: a.amount + b.amount })));
    }
    return needs[0].amount;
}


export const spaceStoichiometry = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const chains = parseLines(lines);
        await outputCallback(serializeChains(chains));
        // const amount = await getPrice(targetName, chains, { log: outputCallback, pause: pause });
        const remain = new Remaining();
        const amount = await oreRequirement(chains.filter(e => e.target.name === targetName)[0].target, chains, remain, { log: outputCallback, pause });
        await outputCallback(amount);
        await outputCallback("Remaining:")
        await outputCallback((remain as any)._remainingMap);
    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
    }
);
