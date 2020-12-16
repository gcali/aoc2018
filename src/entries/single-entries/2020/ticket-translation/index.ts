import { buildGroupsFromSeparator } from "../../../../support/sequences";
import { entryForFile } from "../../../entry";

type ValidityRule = {
    min: number;
    max: number;
}
type TicketRules = {
    [key: string]: ValidityRule[]
}

type Document = {
    ticketRules: TicketRules;
    myTicket: number[];
    nearbyTickets: number[][];
}

const checkInvalidValues = (ticket: number[], ticketRules: TicketRules): number[] => {
    const rules = Object.values(ticketRules);
    const invalid: number[] = [];
    for (const n of ticket) {
        let foundValid = false;
        for (const rule of rules) {
            if (foundValid) {
                break;
            }
            for (const range of rule) {
                if (range.min <= n && range.max >= n) {
                    foundValid = true;
                    break;
                }
            }
        }
        if (!foundValid) {
            invalid.push(n);
        }
    }
    return invalid;
}

const parseLines = (lines: string[]): Document => {
    const groups = [...buildGroupsFromSeparator(lines, e => e.trim().length === 0)];
    const ticketRules: TicketRules = groups[0].map(line => line.split(": ")).map(tokens => {
        return {
            key: tokens[0],
            validity: tokens[1].split(" or ").map(e => ({
                min: parseInt(e.split("-")[0], 10),
                max: parseInt(e.split("-")[1], 10)
            } as ValidityRule))
        };
    }).reduce((acc, next) => {acc[next.key] = next.validity; return acc;}, {} as TicketRules)

    const myTicket = groups[1][1].split(",").map(e => parseInt(e, 10));
    const nearbyTickets = groups[2]
        .slice(1)
        .map(line =>  line.split(",").map(e => parseInt(e, 10)));
    
    return {
        ticketRules,
        myTicket,
        nearbyTickets
    };
}

type TicketIndex = {
    [key: string]: number
};

const checkIfRuleCanBe = (rule: ValidityRule[], index: number, tickets: number[][]): boolean => {
    for (const ticket of tickets) {
        const n = ticket[index];
        let isTicketOK = false;
        for (const range of rule) {
            if (range.min <= n && range.max >= n) {
                isTicketOK = true;
            }
        }
        if (!isTicketOK) {
            return false;
        }
    }
    return true;
};

const buildIndex = (ticketRules: TicketRules, validTickets: number[][], currentIndex: TicketIndex): boolean => {
    const allRules = Object.keys(ticketRules);
    const rulesToFind = allRules.filter(rule => currentIndex[rule] === undefined);
    const takenIndexes = new Set<number>(Object.values(currentIndex));
    const availableIndexes = [...Array(validTickets[0].length).keys()].filter(e => !takenIndexes.has(e));
    if (availableIndexes.length === 0) {
        return true;
    }
    let found = false;
    for (const rule of rulesToFind) {
        const possibleIndexes = availableIndexes.filter(index => checkIfRuleCanBe(ticketRules[rule], index, validTickets));
        if (possibleIndexes.length === 1) {
            currentIndex[rule] = possibleIndexes[0];
            found = true;
        }
    }
    if (found) {
        return buildIndex(ticketRules, validTickets, currentIndex);
    }
    return false;
}

export const ticketTranslation = entryForFile(
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const document = parseLines(lines);
        const invalid = document.nearbyTickets.reduce((acc, next) => acc.concat(checkInvalidValues(next, document.ticketRules)), []);
        await resultOutputCallback(invalid.reduce((acc, next) => acc + next, 0))
    },
    async ({ lines, outputCallback, resultOutputCallback }) => {
        const document = parseLines(lines);
        const validTickets = document.nearbyTickets.filter(e => checkInvalidValues(e, document.ticketRules).length === 0);
        const ticketIndex: TicketIndex = {};
        const hasBuilt = buildIndex(document.ticketRules, validTickets, ticketIndex);
        if (hasBuilt) {
            const interestingRules = Object.keys(ticketIndex).filter(e => e.startsWith("departure"));
            await resultOutputCallback(interestingRules.reduce((acc, next) => acc * document.myTicket[ticketIndex[next]], 1));
        } else {
            await outputCallback("Did not build the index :(");
        }
    },
    { 
        key: "ticket-translation", 
        title: "Ticket Translation",
        embeddedData: true,
        stars: 2,
        supportsQuickRunning: true
    }
);