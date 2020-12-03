import { entryForFile, Pause } from "../../entry";
import { parseMemory, execute, Memory } from "../../../support/intcode";

export const springdroidAdventure = entryForFile(
    async ({ lines, outputCallback, pause }) => {
        const program = [
            // "NOT J J",
            // "AND A J",
            // "AND C J",
            // "NOT J J",
            // "OR J T",
            // "AND D J",
            // "AND T J",
            "NOT C T",
            "OR T J",
            "AND D J",
            "NOT A T",
            "OR T J",
            "WALK"
        ];
        const memory = parseMemory(lines[0]);
        const output: string[] = await executeAscii(program, memory, pause);
        await outputCallback(output.join(""));
    },
    async ({ lines, outputCallback, pause }) => {
        const program = [
            "NOT B J",
            "NOT E T",
            "AND T J",

            "OR T T",
            "AND T T",

            "AND C T",
            "OR F T",
            "NOT T T",
            "OR T J",

            "NOT A T",
            "OR T J",
            "AND D J",
            "RUN"
        ];

        const program2 = [
            "NOT B J",
            "NOT E T",
            "AND T J",

            "OR T T",
            "AND T T",

            "AND C T",
            "OR F T",
            "NOT T T",
            "OR T J",

            "OR F T",
            "AND E T",
            "OR T J",

            "NOT A T",
            "OR T J",
            "AND D J",
            "RUN"
        ];

        const program3 = [
            "NOT B J",
            "NOT E T",
            "AND T J",

            "AND C T",
            "OR F T",
            "NOT T T",
            "OR T J",

            "OR C T",
            "OR E T",
            "NOT T T",
            "OR T J",

            "NOT A T",
            "OR T J",
            "AND D J",
            "RUN"
        ];

        const program4 = [
            "NOT B J",
            "NOT E T",
            "AND T J",

            "NOT C T",
            "NOT T T",
            "OR F T",
            "NOT T T",
            "OR T J",

            "NOT A T",
            "OR T J",
            "AND D J",
            "RUN",
        ];

        const program5 = [
            "OR A T",
            "AND B T",
            "AND C T",
            "NOT T J",

            "OR E T",
            "OR H T",
            "AND T J",

            "AND D J",
            "RUN",
        ];
        const memory = parseMemory(lines[0]);
        const output: string[] = await executeAscii(program5, memory, pause);
        await outputCallback(output.join(""));
    },
    { key: "springdroid-adventure", title: "Springdroid Adventure", stars: 2}
);

async function executeAscii(program: string[], memory: Memory, pause: Pause) {
    const output: string[] = [];
    const input = program.concat([""]).join("\n").split("").map((e) => e.charCodeAt(0));
    let nextInput = 0;
    let lastTime = 0;
    await execute({
        memory,
        input: async () => {
            return input[nextInput++];
        },
        output: async (n) => {
            if (n > 255) {
                output.push(n.toString());
            } else {
                output.push(String.fromCharCode(n));
            }
        },
        next: async () => {
            const current = new Date().getTime();
            if (current - lastTime > 500) {
                lastTime = current;
                await pause();
            }
        },
    });
    return output;
}
