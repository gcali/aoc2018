import { entryForFile } from "../../entry";

interface BridgeComponent {
    ports: [number, number];
}

type Bridge = BridgeComponent[];

const parse = (lines: string[]): BridgeComponent[] => {
    return lines.map((line) => {
        const [a, b] = line.split("/").map((e) => parseInt(e, 10));
        return {
            ports: [a, b]
        };
    });
};

const findStrongestBridge = (nextPort: number, components: BridgeComponent[]): number => {
    const candidates = components.filter((component) => component.ports.indexOf(nextPort) >= 0);
    if (candidates.length === 0) {
        return 0;
    } else {
        return candidates.reduce((acc: number, candidate: BridgeComponent) => {
            const remainingComponents = components.filter((e) => e !== candidate);
            const freePort = candidate.ports[0] === nextPort ? candidate.ports[1] : candidate.ports[0];
            return Math.max(
                candidate.ports[0] +
                candidate.ports[1] +
                findStrongestBridge(freePort, remainingComponents),
                acc
            );
        }, 0);
    }
};

const createAllBridges = (nextPort: number, components: BridgeComponent[]): Bridge[] => {
    const candidates = components.filter((bridge) => bridge.ports.indexOf(nextPort) >= 0);
    if (candidates.length === 0) {
        return [];
    } else {
        return candidates.flatMap((candidate) => {
            const remainingComponents = components.filter((e) => e !== candidate);
            const freePort = candidate.ports[0] === nextPort ? candidate.ports[1] : candidate.ports[0];
            const recursiveBridges = createAllBridges(freePort, remainingComponents);
            if (recursiveBridges.length === 0) {
                return [[candidate]];
            }
            const result = recursiveBridges.map((tail) => [...tail, candidate]);
            return result;
        });
    }
};

export const electromagneticMoat = entryForFile(
    async ({ lines, outputCallback }) => {
        const bridges = parse(lines);
        const value = findStrongestBridge(0, bridges);
        await outputCallback(value);
    },
    async ({ lines, outputCallback }) => {
        const components = parse(lines);
        const bridges = createAllBridges(0, components);
        const maxLength = bridges.map((bridge) => bridge.length).reduce((acc, next) => Math.max(acc, next));
        const interestingBridges = bridges.filter((bridge) => bridge.length === maxLength);
        const bridgesWithCounts = interestingBridges.map((bridge) => ({
            bridge,
            score: bridge.reduce((acc, next) => acc + next.ports[0] + next.ports[1], 0)
        }));
        const bestBridge = bridgesWithCounts.reduce((acc, next) => {
            if (acc.score < next.score) {
                return next;
            }
            return acc;
        });
        await outputCallback(bestBridge.score);
    },
    { key: "electromagnetic-moat", title: "Electromagnetic Moat", stars: 2, }
);
