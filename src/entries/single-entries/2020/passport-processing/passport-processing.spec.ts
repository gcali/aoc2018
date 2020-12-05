import { expect } from "chai";
import "mocha";
import { isPassportValid, isValidField, parseLines } from ".";

type Expected = [string, boolean];

const testData: Array<[string, Expected[]]> = [
    ["byr", [["2002", true], ["2003", false]]],
    ["hgt", [["60in", true], ["190cm", true], ["190in", false], ["190", false]] ],
    ["hcl", [["#123abc", true], ["#123abz", false], ["123abc", false]] ],
    ["ecl", [["brn", true], ["wat", false]]],
    ["pid", [["000000001", true], ["0123456789", false]]]
];

const invalid =
`eyr:1972 cid:100
hcl:#18171d ecl:amb hgt:170 pid:186cm iyr:2018 byr:1926

iyr:2019
hcl:#602927 eyr:1967 hgt:170cm
ecl:grn pid:012533040 byr:1946

hcl:dab227 iyr:2012
ecl:brn hgt:182cm pid:021572410 eyr:2020 byr:1992 cid:277

hgt:59cm ecl:zzz
eyr:2038 hcl:74454a iyr:2023
pid:3556412378 byr:2007`;

const validP =
`pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980
hcl:#623a2f

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

hcl:#888785
hgt:164cm byr:2001 iyr:2015 cid:88
pid:545766238 ecl:hzl
eyr:2022

iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719`;


describe("Passport Processing", () => {
    for (const category of testData) {
        for (const entry of category[1]) {
            it(`should validate ${category[0]} fields: ${entry[0]}`, () => {
                expect(isValidField(category[0], entry[0])).to.equal(entry[1]);
            });
        }
    }
    it("should validate all 4 valid passports", () => {
        const passports = parseLines(validP.split("\n").map((l) => l.trim()));
        expect(passports.filter(isPassportValid)).to.eql(passports);
    });

    it("should not validate any invalid passport", () => {
        const passports = parseLines(invalid.split("\n"));
        expect(passports.filter(isPassportValid)).to.be.empty;
    });

    it("should validate specific passport", () => {
        const passport = parseLines(
`hcl:#888785
hgt:164cm byr:2001 iyr:2015 cid:88
pid:545766238 ecl:hzl
eyr:2022`.split("\n")
        );
        expect(isPassportValid(passport[0])).to.be.true;

    });
});
