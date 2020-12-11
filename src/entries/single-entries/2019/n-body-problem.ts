import { entryForFile } from "../../entry";

interface Coordinate3D {
    x: number;
    y: number;
    z: number;
}

interface Planet {
    position: Coordinate3D;
    velocity: Coordinate3D;
}

function addCoordinate(a: Coordinate3D, b: Coordinate3D): Coordinate3D {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
}

function opposite(a: Coordinate3D): Coordinate3D {
    return {
        x: -a.x,
        y: -a.y,
        z: -a.z
    };
}

const emptyCoordinate = {
    x: 0,
    y: 0,
    z: 0
};

const baseCoordinates = {
    x: { ...emptyCoordinate, x: 1 },
    y: { ...emptyCoordinate, y: 1 },
    z: { ...emptyCoordinate, z: 1 }
};


function parsePlanets(lines: string[]): Planet[] {
    const res = lines.map((line) => {
        const coordinates = line
            .trim()
            .slice(1, line.length - 1)
            .split(",")
            .map((c) => c.trim().split("="))
            .map((c) => ({
                name: c[0],
                value: parseInt(c[1], 10)
            }));
        const get = (s: string): number => coordinates.filter((e) => e.name === s)[0].value;
        return {
            position: {
                x: get("x"),
                y: get("y"),
                z: get("z")
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            }
        };
    });
    return res;
}

function updater(p: Planet, o: Planet, extractor: (p: Planet) => number, toUpdate: Coordinate3D) {
    const pExtracted = extractor(p);
    const oExtracted = extractor(o);
    if (pExtracted < oExtracted) {
        p.velocity = addCoordinate(p.velocity, toUpdate);
    } else if (pExtracted > oExtracted) {
        p.velocity = addCoordinate(p.velocity, opposite(toUpdate));
    }
}

interface UpdaterArgs {
    positionExtractor: (p: Planet) => number;
    velocityExtractor: (p: Planet) => number;
    toUpdate: Coordinate3D;
}

const baseUpdaters: UpdaterArgs[] = [
    {
        positionExtractor: (p) => p.position.x,
        velocityExtractor: (p) => p.velocity.x,
        toUpdate: baseCoordinates.x
    },
    {
        positionExtractor: (p) => p.position.y,
        velocityExtractor: (p) => p.velocity.y,
        toUpdate: baseCoordinates.y
    },
    {
        positionExtractor: (p) => p.position.z,
        velocityExtractor: (p) => p.velocity.z,
        toUpdate: baseCoordinates.z
    },
];


function gravityStep(planets: Planet[], updaters: UpdaterArgs[] = baseUpdaters): Planet[] {
    const outputPlanets = planets.map((p) => ({ ...p }));
    outputPlanets.forEach((p, i) => {
        planets.forEach((o, j) => {
            if (i !== j) {
                updaters.forEach((args) => updater(p, o, args.positionExtractor, args.toUpdate));
                // updater(p, o, e => e.position.x, baseCoordinates.x);
                // updater(p, o, e => e.position.y, baseCoordinates.y);
                // updater(p, o, e => e.position.z, baseCoordinates.z);
            }
        });
    });
    outputPlanets.forEach((p) => p.position = addCoordinate(p.position, p.velocity));
    return outputPlanets;
}

function getSum(c: Coordinate3D): number {
    return Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.z);
}

function getEnergy(planet: Planet) {
    return getSum(planet.velocity) * getSum(planet.position);
}

function serializeCoordinates(c: Coordinate3D): string {
    return `<x=${c.x}, y=${c.y}, z=${c.z}>`;
}

function serializePlanet(planet: Planet): string {
    return `pos=${serializeCoordinates(planet.position)}, vel=${serializeCoordinates(planet.velocity)}`;
}

function serializeTuple(coordinates: number[]): string {
    return coordinates.join("|");
}

function gcd(a: number, b: number): number {
  let t = 0;
  if (a < b) {
      t = b;
      b = a;
      a = t;
  }
//   a < b && (t = b, b = a, a = t); // swap them if a < b
  t = a % b;
  return t ? gcd(b, t) : b;
}

function lcm(a: number, b: number) {
  return a / gcd(a, b) * b;
}

const getLcm = lcm;

// function getLcm(a: number, b: number): number {
//     return mathjs.lcm(a, b);
// }

export const nBodyProblem = entryForFile(
    async ({ lines, outputCallback, pause, isCancelled }) => {
        let planets = parsePlanets(lines);
        const steps = 1000;
        for (let i = 0; i < steps; i++) {
            planets = gravityStep(planets);
        }
        await outputCallback(planets.map(serializePlanet));
        await outputCallback(" ");
        await outputCallback(`Energy after ${steps} steps`);
        await outputCallback(planets.map(getEnergy));
        await outputCallback(`Total: `);
        await outputCallback(planets.map(getEnergy).reduce((a, b) => a + b));

    },
    async ({ lines, outputCallback, pause, isCancelled }) => {
        const updaters = baseUpdaters;
        const planets = parsePlanets(lines);
        const repetitions = updaters.map((u) => {
            let step = 0;
            const values = new Set<string>();
            let currentPlanets = planets;
            while (true) {
                const key = serializeTuple(
                    currentPlanets
                        .map(u.positionExtractor)
                        .concat(currentPlanets.map(u.velocityExtractor))
                );
                if (values.has(key)) {
                    break;
                }
                values.add(key);
                step++;
                currentPlanets = gravityStep(currentPlanets);
            }
            return step;
        });
        const lcmRepetition = repetitions.reduce((a, b) => getLcm(a, b));

        await outputCallback("Starting positions: ");
        await outputCallback(planets.map(serializePlanet));

        await outputCallback(lcmRepetition);
    },
    { key: "n-body-problem", title: "N-Body Problem", stars: 2, embeddedData: "n-body-problem/n-body-problem"}
);
