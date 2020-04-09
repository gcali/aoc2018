import { entryForFile } from "../../entry";
import { manhattanDistance, Coordinate3d } from '../../../support/geometry';
import { NotImplementedError } from '../../../support/error';

interface Particle {
    position: Coordinate3d,
    speed: Coordinate3d,
    acceleration: Coordinate3d
}

const parseTuple = (s: string): Coordinate3d => {
    const split = s.slice(3,-1).split(",").map(e => parseInt(e,10));
    if (split.length !== 3) {
        throw new Error("Invalid string");
    }
    return {
        x: split[0],
        y: split[1],
        z: split[2]
    };
}

const parseParticles = (lines: string[]): Particle[] => {
    return lines.map(line => {
        const [rawPos, rawSpeed, rawAcc] = line.split(", ");
        return {
            position: parseTuple(rawPos),
            speed: parseTuple(rawSpeed),
            acceleration: parseTuple(rawAcc)
        };
    })
};

const updateParticle = (particle: Particle): Particle => {
    const newSpeed: Coordinate3d = {
        x: particle.speed.x + particle.acceleration.x,
        y: particle.speed.y + particle.acceleration.y,
        z: particle.speed.z + particle.acceleration.z,
    };

    const newPosition: Coordinate3d = {
        x: particle.position.x + newSpeed.x,
        y: particle.position.y + newSpeed.y,
        z: particle.position.z + newSpeed.z,
    };
    return {
        ...particle,
        position: newPosition,
        speed: newSpeed
    };
};

const serializeCoordinate = (c: Coordinate3d): string => {
    return [c.x,c.y,c.z].join(",");
}

const createCollided = (particles: Particle[]): (Particle & {collision: boolean})[] => {
    const existing = new Set<string>();
    const collisions = new Set<string>();
    particles.forEach(p => {
        const serialized = serializeCoordinate(p.position);
        if (existing.has(serialized)) {
            collisions.add(serialized);
        }
        existing.add(serialized);
    })
    return particles.map(particle => ({
        ...particle,
        collision: collisions.has(serializeCoordinate(particle.position))
    }));
}

export const particleSwarm = entryForFile(
    async ({ lines, outputCallback }) => {
        const accelerations = lines
            .map(line => line.split(", ")[2].split("=<")[1].slice(0,-1))
            .map(rawAcc => rawAcc.split(",").map(e => parseInt(e, 10)))
            .map(vs => ({
                x: vs[0],
                y: vs[1],
                z: vs[2]
            }));
        const lowestAcceleration = accelerations
            .map((e, index) => ({e, index}))
            .filter(e => manhattanDistance(e.e, {x:0,y:0,z:0}) === 0);

            await outputCallback(accelerations);
        await outputCallback(lowestAcceleration);

    },
    async ({ lines, outputCallback }) => {
        let particles = parseParticles(lines);

        let lastCollision = 0;
        let currentStep = 0;

        await outputCallback(particles.length);
        while (currentStep - lastCollision < 1000) {
            particles = particles.map(updateParticle);
            const oldLength = particles.length;
            particles = createCollided(particles).filter(p => !p.collision);
            if (particles.length !== oldLength) {
                lastCollision = currentStep;
            }
            currentStep++;
        }
        await outputCallback(particles.length);

    },
    { key: "particle-swarm", title: "Particle Swarm", stars: 2, }
);