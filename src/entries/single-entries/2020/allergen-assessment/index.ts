import { DefaultListDictionaryString } from "../../../../support/data-structure";
import { entryForFile } from "../../../entry";

type Recipe = {
    ingredients: string[];
    allergens: string[];
};

type MatchingRecipe = {
    ingredients: string[];
    allergens: string[];
};

type AllergenIndex = {[key: string]: string};

type AllergenCandidates = DefaultListDictionaryString<string>;

const clearIntersection = (
    a: MatchingRecipe,
    b: MatchingRecipe,
    allergen: string,
    allergenCandidates: AllergenCandidates,
): boolean => {
    const aIngredients = new Set<string>(a.ingredients);
    const bIngredients = new Set<string>(b.ingredients);
    let hasUpdated = false;
    for (const ingredient of a.ingredients) {
        if (!bIngredients.has(ingredient)) {
            const allergens = allergenCandidates.get(ingredient);
            const index = allergens.indexOf(allergen);
            if (index >= 0) {
                hasUpdated = true;
                allergens.splice(index, 1);
            }
        }
    }
    for (const ingredient of b.ingredients) {
        if (!aIngredients.has(ingredient)) {
            const allergens = allergenCandidates.get(ingredient);
            const index = allergens.indexOf(allergen);
            if (index >= 0) {
                hasUpdated = true;
                allergens.splice(index, 1);
            }
        }
    }
    return hasUpdated;
};

const updateAllergens = (
    recipes: MatchingRecipe[],
    index: AllergenIndex,
    candidates: AllergenCandidates,
): void => {
    for (const recipe of recipes) {
        recipe.ingredients = recipe.ingredients.filter((e) => (!index[e]) && candidates.get(e).length > 0);
        recipe.allergens = recipe.allergens.filter((e) => !Object.values(index).includes(e));
    }

    let hasUpdated = false;
    for (const recipe of recipes) {
        for (const allergen of recipe.allergens) {
            const currentRecipeCandidates = recipe.ingredients.map((i) => ({
                ingredient: i,
                allergens: candidates.get(i)
            })).filter((e) => e.allergens.includes(allergen));
            if (currentRecipeCandidates.length === 1) {
                const found = currentRecipeCandidates[0];
                hasUpdated = true;
                index[found.ingredient] = allergen;
                candidates.get(found.ingredient).length = 0;
                candidates.get(found.ingredient).push(allergen);
            }
        }
    }
    if (hasUpdated) {
        return updateAllergens(recipes, index, candidates);
    }
};

const checkCandidate = (
    candidate: string,
    a: MatchingRecipe,
    b: MatchingRecipe,
    recipes: MatchingRecipe[],
    allergenIndex: AllergenIndex,
    allergenCandidates: AllergenCandidates
): boolean => {
    if (a.allergens.includes(candidate) && b.allergens.includes(candidate)) {
        const result = clearIntersection(a, b, candidate, allergenCandidates);
        if (result) {
            updateAllergens(recipes, allergenIndex, allergenCandidates);
            return true;
        }
    }
    return false;
};

const intersect = (
    recipes: MatchingRecipe[],
    index: AllergenIndex,
    allergenCandidates: AllergenCandidates
): boolean => {
    for (let i = 0; i < recipes.length; i++) {
        for (let j = i + 1; j < recipes.length; j++) {
            const candidates = new Set<string>(recipes[i].allergens.concat(recipes[j].allergens));
            for (const candidate of candidates) {
                if (checkCandidate(candidate, recipes[i], recipes[j], recipes, index, allergenCandidates)) {
                    return true;
                }
            }
        }
    }
    return false;
};

const createMatching = (recipes: Recipe[]): {allergens: string[], recipes: MatchingRecipe[]} => {
    const allAllergens = [...recipes.reduce((acc, next) => {
        next.allergens.forEach((a) => acc.add(a));
        return acc;
    }, new Set<string>())];
    return {
        allergens: allAllergens,
        recipes: recipes.map((r) => ({
            allergens: r.allergens,
            ingredients: [...r.ingredients],
        }))
    };
};

const parseLines = (lines: string[]): Recipe[] => {
    return lines.map((line) => {
        const [a, b] = line.split(" (contains ");
        return {
            ingredients: a.split(" "),
            allergens: b.replaceAll(")", "").split(", ")
        };
    });
};

export const allergenAssessment = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
//         lines =
// `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
// trh fvjkl sbzzf mxmxvkd (contains dairy)
// sqjhc fvjkl (contains soy)
// sqjhc mxmxvkd sbzzf (contains fish)`.split("\n");
        const input = parseLines(lines);
        const {recipes, allergens} = createMatching(input);
        const allergenIndex: AllergenIndex = {};
        const allergenCandidates = new DefaultListDictionaryString<string>();
        const allIngredients = new Set<string>(recipes.flatMap((r) => r.ingredients));
        for (const allergen of allergens) {
            for (const ingredient of allIngredients) {
                allergenCandidates.add(ingredient, allergen);
            }
        }
        let iterations = 0;
        while (intersect(recipes, allergenIndex, allergenCandidates)) {
            iterations++;
            if (iterations % 10 === 0) {
                await outputCallback(iterations);
            }
        }
        await outputCallback(iterations);
        await outputCallback(JSON.stringify(allergenIndex));
        const safeIngredients = [...allIngredients].filter((e) => !allergenIndex[e]);
        await outputCallback(safeIngredients);
        const count = input.reduce((acc, next) => {
            const interesting = next.ingredients.filter((e) => safeIngredients.includes(e));
            return acc + interesting.length;
        }, 0);
        await resultOutputCallback(count);
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
//         lines =
// `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
// trh fvjkl sbzzf mxmxvkd (contains dairy)
// sqjhc fvjkl (contains soy)
// sqjhc mxmxvkd sbzzf (contains fish)`.split("\n");
        const input = parseLines(lines);
        const {recipes, allergens} = createMatching(input);
        const allergenIndex: AllergenIndex = {};
        const allergenCandidates = new DefaultListDictionaryString<string>();
        const allIngredients = new Set<string>(recipes.flatMap((r) => r.ingredients));
        for (const allergen of allergens) {
            for (const ingredient of allIngredients) {
                allergenCandidates.add(ingredient, allergen);
            }
        }
        while (intersect(recipes, allergenIndex, allergenCandidates)) {
            // nothing to do here
        }
        const canonical = Object.keys(allergenIndex)
            .sort((a, b) => allergenIndex[a].localeCompare(allergenIndex[b]))
            .join(",");
        await resultOutputCallback(canonical);
    },
    {
        key: "allergen-assessment",
        title: "Allergen Assessment",
        embeddedData: true,
        stars: 2
    }
);
