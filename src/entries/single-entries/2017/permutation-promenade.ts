import { entryForFile } from "../../entry";
const {
  performance
} = require('perf_hooks');

export const permutationPromenade = entryForFile(
    async ({ lines, outputCallback }) => {
        const programs = programListGenerator(16);
        const instructions = lines[0].split(",").map(i => i.trim());
        const reordered = dance(instructions, programs);
        await outputCallback(reordered.join(""));
    },
    async ({ lines, outputCallback }) => {
        let programs = programListGenerator(16);
        const instructions = lines[0].split(",").map(i => i.trim());
        const total = 1000000000;
        const tsStart = performance.now();
        const dances: string[] = [];
        for (let i = 0; i < total; i++) {
            if (i % 100 === 0) {
                const currentRatio = i/total;
                await outputCallback(`Done ${currentRatio * 100}%`);
                const currentTs = performance.now();
                const deltaTs = currentTs - tsStart;
                const speed = i / deltaTs;
                const finishIn = (total - i) * speed;
                await outputCallback(`Finishing in ${msToTime(finishIn)} ms`);
            }
            programs = dance(instructions, programs);
            const serialized = programs.join("");
            if (dances.indexOf(serialized) >= 0) {
                await outputCallback("Found at cycle " + i);
                await outputCallback("Dances length: " + dances.length);
                break;
            }
            dances.push(serialized);
        }
        const requiredIndex = (total - 1) % dances.length;
        await outputCallback(dances[requiredIndex]);
    }
);
function msToTime(s: number) {

  // Pad to 2 or 3 digits, default is 2
  function pad(n: number, z?: number) {
    z = z || 2;
    return ('00' + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

export function dance(instructions: string[], programs: string[]) {
    programs = [...programs];
    let currentPosition = 0;
    instructions.forEach(instruction => {
        const identifier = instruction[0];
        switch (identifier) {
            case "s":
                const delta = parseInt(instruction.slice(1), 10);
                currentPosition -= delta;
                while (currentPosition < 0) {
                    currentPosition += programs.length;
                }
                break;
            case "x":
                {
                    const [a, b] = instruction.slice(1).split("/").map(e => parseInt(e, 10));
                    const aIndex = (currentPosition + a) % programs.length;
                    const bIndex = (currentPosition + b) % programs.length;
                    swap(programs, aIndex, bIndex);
                }
                break;
            case "p":
                {
                    const [a, b] = instruction.slice(1).split("/");
                    const aIndex = programs.indexOf(a);
                    const bIndex = programs.indexOf(b);
                    swap(programs, aIndex, bIndex);
                }
                break;
        }
    });
    const reordered = programs.slice(currentPosition).concat(programs.slice(0, currentPosition));
    return reordered;
}

export function programListGenerator(n: number): string[] {
    return [...Array(n).keys()].map(index => String.fromCharCode("a".charCodeAt(0) + index));
}

function swap(programs: string[], aIndex: number, bIndex: number) {
    const temp = programs[aIndex];
    programs[aIndex] = programs[bIndex];
    programs[bIndex] = temp;
}
