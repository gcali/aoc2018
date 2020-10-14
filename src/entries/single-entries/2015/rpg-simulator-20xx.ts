import { entryForFile } from "../../entry";
import { subsetGenerator } from '../../../support/sequences';

type Item = {
    name: string;
    cost: number;
    damage: number;
    armor: number;
};

type ShopKey = "weapons" | "armor" | "rings";

const shop: {
    weapons: Item[];
    armor: Item[];
    rings: Item[];
} = {
    weapons: [
        { name: "Dagger", cost: 8, damage: 4, armor: 0 },
        { name: "Shortsword", cost: 10, damage: 5, armor: 0 },
        { name: "Warhammer", cost: 25, damage: 6, armor: 0 },
        { name: "Longsword", cost: 40, damage: 7, armor: 0 },
        { name: "Greataxe", cost: 74, damage: 8, armor: 0 },
    ],
    armor: [
        { name: "Leather", cost: 13, damage: 0, armor: 1 },
        { name: "Chainmail", cost: 31, damage: 0, armor: 2 },
        { name: "Splintmail", cost: 53, damage: 0, armor: 3 },
        { name: "Bandedmail", cost: 75, damage: 0, armor: 4 },
        { name: "Platemail", cost: 102, damage: 0, armor: 5 },
        { name: "None", cost: 0, damage: 0, armor: 0 }
    ],
    rings: [
        { name: "Damage +1", cost: 25, damage: 1, armor: 0 },
        { name: "Damage +2", cost: 50, damage: 2, armor: 0 },
        { name: "Damage +3", cost: 100, damage: 3, armor: 0 },
        { name: "Defense +1", cost: 20, damage: 0, armor: 1 },
        { name: "Defense +2", cost: 40, damage: 0, armor: 2 },
        { name: "Defense +3", cost: 80, damage: 0, armor: 3 },
    ]
};

type State = {
    hitPoints: number;
    damage: number;
    armor: number;
}

const parseState = (lines: string[]): State => {
    const [hitPoints, damage, armor] = lines.map(l => parseInt(l.split(": ")[1], 10));
    return {
        hitPoints,
        damage,
        armor
    };
};

const fight = (player: State, monster: State): boolean => {
    const fPlayer = { ...player };
    const fMonster = { ...monster };
    while (true) {
        fMonster.hitPoints -= Math.max(1, fPlayer.damage - fMonster.armor);
        if (fMonster.hitPoints <= 0) {
            return true;
        }
        fPlayer.hitPoints -= Math.max(1, fMonster.damage - fPlayer.armor);
        if (fPlayer.hitPoints <= 0) {
            return false;
        }
    }
}

export const rpgSimulator20xx = entryForFile(
    async ({ lines, outputCallback }) => {
        const bossState = parseState(lines);
        let minExpense = Number.POSITIVE_INFINITY;
        for (const weapon of shop.weapons) {
            for (const armor of shop.armor) {
                for (const chosenRings of subsetGenerator(shop.rings, 0)) {
                    if (chosenRings.length <= 2) {
                        const expense = weapon.cost + armor.cost + chosenRings.reduce((acc, next) => acc + next.cost, 0);
                        if (expense < minExpense) {
                            const hasWon = fight({
                                hitPoints: 100,
                                armor: armor.armor + chosenRings.reduce((acc, next) => acc + next.armor, 0),
                                damage: weapon.damage + chosenRings.reduce((acc, next) => acc + next.damage, 0)
                            }, bossState);
                            if (hasWon) {
                                minExpense = expense;
                            }
                        }
                    }
                }
            }

        }
        await outputCallback(minExpense);
    },
    async ({ lines, outputCallback }) => {
        const bossState = parseState(lines);
        let maxExpense = Number.NEGATIVE_INFINITY;
        for (const weapon of shop.weapons) {
            for (const armor of shop.armor) {
                for (const chosenRings of subsetGenerator(shop.rings, 0)) {
                    if (chosenRings.length <= 2) {
                        const expense = weapon.cost + armor.cost + chosenRings.reduce((acc, next) => acc + next.cost, 0);
                        if (expense > maxExpense) {
                            const hasWon = fight({
                                hitPoints: 100,
                                armor: armor.armor + chosenRings.reduce((acc, next) => acc + next.armor, 0),
                                damage: weapon.damage + chosenRings.reduce((acc, next) => acc + next.damage, 0)
                            }, bossState);
                            if (!hasWon) {
                                maxExpense = expense;
                            }
                        }
                    }
                }
            }
        }
        await outputCallback(maxExpense);
    },
    { key: "rpg-simulator-20xx", title: "RPG Simulator 20XX", stars: 2 }
);