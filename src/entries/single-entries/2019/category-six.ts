import { entryForFile } from "../../entry";
import { Memory, parseMemory, execute } from "../../../support/intcode";
import { Queue } from "../../../support/data-structure";

type PacketSender = (n: number) => (((n: number) => undefined) | undefined);

interface Program {
    memory: Memory;
    inputQueue: Queue<Packet | number>;
    address: number;
    packetSender?: PacketSender;
    nextPacket?: Packet;
    resolver?: () => void;
}

interface Packet {
    x: number;
    y?: number;
    isFromNat?: boolean;
}

const isPacket = (e: Packet | number): e is Packet => {
    return (e as Packet).x !== undefined;
};

class ClosingDown extends Error {
    public readonly FLAG = "ClosingDown";
    constructor(s: string) {
        super(s);
    }
}

export const categorySix = entryForFile(
    async ({ lines, outputCallback }) => {
        const memory = parseMemory(lines[0]);
        const programs: Program[] = [...Array(50).keys()].map((i) => ({
            memory,
            inputQueue: new Queue<Packet | number>(),
            address: i
        }));

        programs.forEach((p) => p.inputQueue.add(p.address));

        let sentPackets = 0;
        let receivedPackets = 0;
        const iteration = 0;
        let shouldClose = false;
        const emptyPromise = async () => {
            while (!shouldClose) {
                await new Promise<void>((resolve, reject) => resolve());
            }
            await outputCallback("NAT closing down");
        };
        const promises: Array<Promise<any>> = programs.map<Promise<any>>((p) =>
            execute({
                memory: p.memory,
                input: async () => {
                    if (shouldClose) {
                        throw new ClosingDown(`Program ${p.address} closing down`);
                    }
                    if (p.nextPacket !== undefined) {
                        if (p.nextPacket.y === undefined) {
                            throw new Error("Packet wasn't full");
                        }
                        const y = p.nextPacket.y;
                        p.nextPacket = undefined;
                        receivedPackets++;
                        console.log(`Packet received, pkts: ${receivedPackets}/${sentPackets}`);
                        return y;
                    }
                    const res = p.inputQueue.get();
                    if (res === null) {
                        return -1;
                    } else if (isPacket(res)) {
                        p.nextPacket = res;
                        return res.x;
                    } else {
                        return res;
                    }
                },
                output: async (n) => {
                    if (shouldClose) {
                        throw new ClosingDown(`Program ${p.address} closing down`);
                    }
                    if (!p.packetSender) {
                        const address = n;
                        p.packetSender = ((x) => {
                            const packet: Packet = {
                                x
                            };
                            if (address !== 255) {
                                programs[address].inputQueue.add(packet);
                            }
                            return (y) => {
                                if (address === 255) {
                                    console.log("Packet: " + y);
                                    shouldClose = true;
                                } else {
                                    packet.y = y;
                                    sentPackets++;
                                    console.log(`Packet sent, pkts: ${receivedPackets}/${sentPackets}`);
                                }
                                return undefined;
                            };
                        });
                    } else {
                        p.packetSender = p.packetSender(n);
                    }
                },
                close: () => {
                    throw new ClosingDown(`Program ${p.address} is closing down`);
                },
                next: async () => {
                    if (shouldClose) {
                        throw new ClosingDown(`Program ${p.address} closing down`);
                    }
                    const promise = new Promise<void>((resolve, reject) => {
                        p.resolver = resolve;
                    });
                    const otherResolver = programs[(p.address + 1) % programs.length].resolver;
                    if (otherResolver) {
                        otherResolver();
                    }
                    await promise;
                }
            })).concat([emptyPromise()]);

        try {
            await Promise.all(promises);
        } catch (e) {
            if ((e as ClosingDown).FLAG) {
                // do nothing
            } else {
                throw e;
            }
        }
    },
    async ({ lines, outputCallback }) => {
        const memory = parseMemory(lines[0]);
        const programs: Program[] = [...Array(50).keys()].map((i) => ({
            memory,
            inputQueue: new Queue<Packet | number>(),
            address: i
        }));

        programs.forEach((p) => p.inputQueue.add(p.address));

        let sentPackets = 0;
        let receivedPackets = 0;
        let natPacket: Packet | null = null;
        const iteration = 0;
        let shouldClose = false;
        let lastNatY: number | null = null;
        const isIdle = (): boolean => programs.filter((p) => p.inputQueue.isEmpty).length === programs.length;
        const emptyPromise = async () => {
            while (!shouldClose) {
                if (natPacket === null || !isIdle()) {
                    await new Promise<void>((resolve, reject) => resolve());
                    continue;
                }
                if (natPacket === null) {
                    throw new Error("What happened here?");
                }
                console.log("NAT sending package");
                natPacket.isFromNat = true;
                programs[0].inputQueue.add(natPacket);
                natPacket = null;
            }
            await outputCallback("NAT closing down");
        };
        const promises: Array<Promise<any>> = programs.map<Promise<any>>((p) =>
            execute({
                memory: p.memory,
                input: async () => {
                    if (shouldClose) {
                        throw new ClosingDown(`Program ${p.address} closing down`);
                    }
                    if (p.nextPacket !== undefined) {
                        if (p.nextPacket.y === undefined) {
                            throw new Error("Packet wasn't full");
                        }
                        const y = p.nextPacket.y;
                        if (p.nextPacket.isFromNat) {
                            if (y === lastNatY) {
                                console.log("Found duplicate! " + y);
                                shouldClose = true;
                                throw new ClosingDown("Closing down");
                            }
                            console.log(`From NAT, not duplicate: ${y} !== ${lastNatY} `);
                            lastNatY = y;
                        }
                        p.nextPacket = undefined;
                        receivedPackets++;
                        console.log(`Packet received, pkts: ${receivedPackets}/${sentPackets}`);
                        return y;
                    }
                    const res = p.inputQueue.get();
                    if (res === null) {
                        return -1;
                    } else if (isPacket(res)) {
                        p.nextPacket = res;
                        return res.x;
                    } else {
                        return res;
                    }
                },
                output: async (n) => {
                    if (shouldClose) {
                        throw new ClosingDown(`Program ${p.address} closing down`);
                    }
                    if (!p.packetSender) {
                        const address = n;
                        p.packetSender = ((x) => {
                            const packet: Packet = {
                                x
                            };
                            if (address !== 255) {
                                programs[address].inputQueue.add(packet);
                            } else {
                                console.log("Sending packet to NAT");
                                natPacket = packet;
                            }
                            return (y) => {
                                packet.y = y;
                                sentPackets++;
                                console.log(`Packet sent, pkts: ${receivedPackets}/${sentPackets}`);
                                return undefined;
                            };
                        });
                    } else {
                        p.packetSender = p.packetSender(n);
                    }
                },
                close: () => {
                    throw new ClosingDown(`Program ${p.address} is closing down`);
                },
                next: async () => {
                    if (shouldClose) {
                        throw new ClosingDown(`Program ${p.address} closing down`);
                    }
                    const promise = new Promise<void>((resolve, reject) => {
                        p.resolver = resolve;
                    });
                    const otherResolver = programs[(p.address + 1) % programs.length].resolver;
                    if (otherResolver) {
                        otherResolver();
                    }
                    await promise;
                }
            })).concat([emptyPromise()]);

        try {
            await Promise.all(promises);
        } catch (e) {
            if ((e as ClosingDown).FLAG) {
                // do nothing
            } else {
                throw e;
            }
        }
    },
    { key: "category-six", title: "Category Six", stars: 2, embeddedData: true }
);
