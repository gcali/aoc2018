import { entryForFile } from "../../../entry";
import { buildVisualizer } from "./visualizer";

export interface Passport {[key: string]: string; }

export const parseLines = (lines: string[]): Passport[] => {
    const passports: Passport[] = [];
    let currentPassport: Passport = {};
    for (let line of lines) {
        line = line.trim();
        if (!line && Object.keys(currentPassport).length > 0) {
            passports.push(currentPassport);
            currentPassport = {};
        } else {
            const tokens = line.split(" ").map((t) => t.trim().split(":"));
            for (const [field, value] of tokens) {
                currentPassport[field] = value;
            }
        }
    }
    if (Object.keys(currentPassport).length > 0) {
        passports.push(currentPassport);
    }
    return passports;
};

export const validFields = [
    "byr",
    "iyr",
    "eyr",
    "hgt",
    "hcl",
    "ecl",
    "pid",
    "cid"
];

const hasPassportValidFields = (passport: Passport): boolean => {
    const expectedKeys = new Set<string>(validFields.slice(0, validFields.length - 1));
    for (const field of Object.keys(passport)) {
        expectedKeys.delete(field);
    }
    return expectedKeys.size === 0;
};

const getMissingFields = (passport: Passport): string[] => {
    const expectedKeys = new Set<string>(validFields.slice(0, validFields.length - 1));
    for (const field of Object.keys(passport)) {
        expectedKeys.delete(field);
    }
    return [...expectedKeys.values()];
};

const getInvalidFields = (passport: Passport): string[] => {
    const missing = getMissingFields(passport);
    const invalid = Object.keys(passport).filter((field) => !isValidField(field, passport[field]));
    return missing.concat(invalid);
};

export const isPassportValid = (passport: Passport): boolean => {
    if (!hasPassportValidFields(passport)) {
        return false;
    }
    for (const field of Object.keys(passport)) {
        if (!isValidField(field, passport[field])) {
            return false;
        }
    }
    return true;
};

export const isValidField = (field: string, value: string): boolean => {
        const hasFourDigits = () => value.length === 4;
        const intValue = () => parseInt(value, 10);
        switch (field) {
            case "byr":
                if (!hasFourDigits()) {
                    return false;
                }
                if (intValue() < 1920 || intValue() > 2002) {
                    return false;
                }
                break;

            case "iyr":
                if (!hasFourDigits() || intValue() < 2010 || intValue() > 2020) {
                    return false;
                }
                break;
            case "eyr":
                if (!hasFourDigits() || intValue() < 2020 || intValue() > 2030) {
                    return false;
                }
                break;
            case "hgt":
                const suffix = value.slice(-2);
                const height = parseInt(value.slice(0, -2), 10);
                if (height.toString() !== value.slice(0, -2)) {
                    return false;
                }
                if (suffix === "cm") {
                    if (height < 150 || height > 193) {
                        return false;
                    }
                } else if (suffix === "in") {
                    if (height < 59 || height > 76) {
                        return false;
                    }
                } else {
                    return false;
                }
                break;

            case "hcl":
                if (!/^#[0-9a-f]{6}$/.test(value)) {
                    return false;
                }
                break;
            case "ecl":
                const expectedEyes = [
"amb", "blu", "brn", "gry", "grn", "hzl", "oth"
                ];
                if (!expectedEyes.includes(value)) {
                    return false;
                }
                break;
            case "pid":
                if (!/^[0-9]{9}$/.test(value)) {
                    console.log(value);
                    return false;
                }
                break;
            case "cid":
                break;
            default:
                console.log("Invalid field");
                break;
        }
        return true;
};

export const passportProcessing = entryForFile(
    async ({ 
        lines, 
        resultOutputCallback, 
        screen, 
        pause, 
        setAutoStop 
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const passports = parseLines(lines);
        await visualizer.setupPassports(passports);
        let validPassports = 0;
        for (let i = 0; i < passports.length; i++) {
            const passport = passports[i];
            const missing = getMissingFields(passport);
            if (missing.length > 0) {
                await visualizer.setWrongFields(i, missing);
            } else {
                await visualizer.setValid(i);
                validPassports++;
            }
        }
        await resultOutputCallback(validPassports);
    },
    async ({ 
        lines, 
        resultOutputCallback, 
        screen, 
        pause, 
        setAutoStop 
    }) => {
        setAutoStop();
        const visualizer = buildVisualizer(screen, pause);
        const passports = parseLines(lines);
        await visualizer.setupPassports(passports);
        let validPassports = 0;
        for (let i = 0; i < passports.length; i++) {
            const passport = passports[i];
            const missing = getInvalidFields(passport);
            if (missing.length > 0) {
                await visualizer.setWrongFields(i, missing);
            } else {
                await visualizer.setValid(i);
                validPassports++;
            }
        }
        await resultOutputCallback(validPassports);
    },
    {
        key: "passport-processing",
        title: "Passport Processing",
        stars: 2,
        customComponent: "pause-and-run",
        suggestedDelay: 20,
        supportsQuickRunning: true
    }
);

/*
8:39
Ok, let's start today, I've done the scaffolding and read the puzzle.
The first part seems easy, let's see if it is so

11 minutes later...
First part done at the first try, the parsing went pretty smooth and it was pretty fun,
let's see about the second

1 hour later...
Ok, turns out I hated the second part. I did a stupid error with regexes (wasn't there
something about trying to solve one problem with regexes and having two problems as a
consequence?), I tried to validate the passport with /[0-9]{6}/, when of course I
should have used /^[0-9]{6}$/.
Having one extra valid passport meant I had no clue about what rule was failing,
and that meant double checking all the rules; when I found no issue, I started writing
tests. Luckily, my case was covered in the test cases given in the examples; at the
same time, it was the last example, so it took some time. In any case, it's done,
let's forget about this one, shall we?
*/
