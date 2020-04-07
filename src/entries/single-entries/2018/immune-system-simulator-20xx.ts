import { entryForFile } from "../../entry";

interface Abilities {
    type: AbilityType;
    damageType: string;
}

type AbilityType = "immune" | "weak";

interface Group {
    units: number;
    hp: number;
    damage: number;
    damageType: string;
    initiative: number;
    abilities: Abilities[];
    army: string;
}

interface Army {
    name: string;
    groups: Group[]
}

interface FightOrder {
    group: Group;
    target: Group | null;
}

const fillWithTarget = (groups: Group[]): FightOrder[] => {
    const targetable = [...groups];
    return groups.map(group => {
        const candidates = targetable
            .map((g, index) => ({group: g, index}))
            .filter(g => g.group.army !== group.army)
            .map(g => ({
                group: g.group,
                damage: getDamage(group, g.group),
                index: g.index
            }))
            .filter(e => e.damage > 0)
            .sort((a, b) => (b.damage - a.damage));


        const target = candidates.length === 0 ? null : candidates[0];
        if (target !== null) {
            targetable.splice(target.index, 1);
        }
        return {
            group,
            target: target !== null ? target.group : null
        };
    });
}

const getFightOrder = (armies: Army[]): FightOrder[] => {
    const chooseOrder = armies.flatMap(army => army.groups).map(g => ({
        effectivePower: getEffectivePower(g),
        group: g
    })).sort((a, b) => {
        if (a.effectivePower === b.effectivePower) {
            return b.group.initiative - a.group.initiative;
        }
        return b.effectivePower - a.effectivePower;
    });
    const withTarget = fillWithTarget(chooseOrder.map(e => e.group));
    return withTarget.sort((a, b) => b.group.initiative - a.group.initiative);
}

const getEffectivePower = (group: Group): number => {
    return group.units * group.damage;
}

const getDamage = (group: Group, target: Group): number => {
    const immunities = target.abilities.filter(a => a.type === "immune").map(e => e.damageType);
    if (immunities.indexOf(group.damageType) >= 0) {
        return 0;
    }
    const basePower = getEffectivePower(group);
    const weaknesses = target.abilities.filter(a => a.type === "weak").map(e => e.damageType);
    if (weaknesses.indexOf(group.damageType) >= 0) {
        return basePower * 2;
    }
    return basePower;
}

const fightRound = (armies: Army[]): void => {
    const fightOrder = getFightOrder(armies);
    fightOrder.forEach(element => {
        if (element.group.units > 0 && element.target !== null) {
            const damage = getDamage(element.group, element.target);
            element.target.units -= Math.max(Math.floor(damage / element.target.hp), 0);
        }
    });
    armies.forEach(army => army.groups = army.groups.filter(e => e.units > 0));
}

const parseAbilities = (section: string): Abilities[] => {
    const singleSections = section.split("; ");
    return singleSections.flatMap(single => {
        const tokens = single.split(" ");
        const type = tokens[0];
        const damageTypes = tokens.slice(2).map(e => e.endsWith(",") ? e.slice(0,-1) : e);
        return damageTypes.map(damageType => {
            return {
                type: type as AbilityType, 
                damageType
            };
        })
    });
};

const parseGroups = (lines: string[], army: string): Group[] => {
    return lines.map(line => {
        const tokens = line.split(" ");
        const units = parseInt(tokens[0], 10);
        const hp = parseInt(tokens[tokens.indexOf("hit")-1], 10);
        const damageWordIndex = tokens.lastIndexOf("damage");
        const damage = parseInt(tokens[damageWordIndex - 2], 10);
        const damageType = tokens[damageWordIndex-1];
        const initiativeIndex = tokens.lastIndexOf("initiative") + 1;
        const initiative = parseInt(tokens[initiativeIndex], 10);
        const abilitySection = line.indexOf("(") >= 0 ? line.slice(line.indexOf("(") + 1, line.indexOf(")")) : "";
        return {
            units,
            hp,
            damage,
            initiative,
            damageType,
            abilities: parseAbilities(abilitySection),
            army
        };
    });
};

const parseLines = (lines: string[]): Army[] => {
    return lines.join("\n").split("\n\n").map(rawArmy => {
        const armyLines = rawArmy.split("\n");
        const name = armyLines[0].trim().slice(0,-1);
        return {
            name,
            groups: parseGroups(armyLines.slice(1), name)
        };
    });
}

export const serialize = (armies: Army[]): string => {
    return armies.map(a => [a.name + ":"].concat(
        a.groups
            .map(g => g.units)
            .map((u, i) => `Group ${i} contains ${u} units`)
        ).join("\n")).join("\n");
}

export const boostArmy = (army: Army, amount: number) => {
    army.groups.forEach(group => group.damage += amount);
}

const countUnits = (armies: Army[]): number => {
    return armies.reduce((acc, next) => acc + next.groups.reduce((acc, next) => acc + next.units, 0), 0);
}

export const immuneSystemSimulator20XX = entryForFile(
    async ({ lines, outputCallback }) => {
        const armies = parseLines(lines);
        await outputCallback(serialize(armies));
        while (armies.filter(a => a.groups.length > 0).length > 1) {
            fightRound(armies);
            await outputCallback(serialize(armies));
        }
        const winningArmy = armies.filter(e => e.groups.length > 0)[0];
        await outputCallback(`Army ${winningArmy.name} won with ${winningArmy.groups.reduce((acc, next) => acc + next.units, 0)} units`);
    },
    async ({ lines, outputCallback }) => {
        const armies = parseLines(lines);
        let hasImmuneWon = false;
        const immuneSystemArmyName = "Immune System";
        let boostingBy = 0;
        while (!hasImmuneWon) {
            let isDraw = false;
            boostingBy++;
            const clonedArmies = armies.map(army => ({
                ...army,
                groups: army.groups.map(group => ({ ...group }))
            }));
            boostArmy(clonedArmies.filter(army => army.name === immuneSystemArmyName)[0], boostingBy);
            while (clonedArmies.filter(a => a.groups.length > 0).length > 1) {
                const lastUnits = countUnits(clonedArmies);
                fightRound(clonedArmies);
                const newUnits = countUnits(clonedArmies);
                if (lastUnits === newUnits) {
                    isDraw = true;
                    break;
                }
            }
            if (isDraw) {
                await outputCallback("Draw!");
                continue;
            }
            const winningArmy = clonedArmies.filter(e => e.groups.length > 0)[0]; 
            hasImmuneWon = winningArmy.name === immuneSystemArmyName;
            if (boostingBy % 1 === 0) {
                await outputCallback(boostingBy);
                await outputCallback(`${winningArmy.name} won by ${countUnits([winningArmy])} units`);
            }
        }
        await outputCallback("Min boost: " + boostingBy);
    }
);