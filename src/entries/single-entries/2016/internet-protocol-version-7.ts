import { entryForFile } from "../../entry";

interface IP {
    sections: string[];
    hypernets: string[];
}

const parseLines = (lines: string[]): IP[] => {
    return lines.map((line) => {
        let section: string[] = [];
        let hypernet: string[] = [];
        const result: IP = {
            sections: [],
            hypernets: []
        };
        let isHypernet = false;
        for (const c of line) {
            if (c === "[") {
                isHypernet = true;
                if (section.length > 0) {
                    result.sections.push(section.join(""));
                    section = [];
                }
            } else if (c === "]") {
                isHypernet = false;
                result.hypernets.push(hypernet.join(""));
                hypernet = [];
            } else {
                if (isHypernet) {
                    hypernet.push(c);
                } else {
                    section.push(c);
                }
            }
        }
        if (hypernet.length > 0) {
            result.hypernets.push(hypernet.join(""));
        }
        if (section.length > 0) {
            result.sections.push(section.join(""));
        }
        return result;
    });
};

const hasABBA = (sequence: string): boolean => {
    for (let i = 0; i < sequence.length - 3; i++) {
        if (sequence[i + 3] === sequence[i] && sequence[i + 1] === sequence[i + 2] && sequence[i + 1] !== sequence[i]) {
            return true;
        }
    }
    return false;
};

const supportsTLS = (ip: IP): boolean => {
    for (const hyper of ip.hypernets) {
        if (hasABBA(hyper)) {
            return false;
        }
    }
    for (const section of ip.sections) {
        if (hasABBA(section)) {
            return true;
        }
    }
    return false;
};

const supportsSSL = (ip: IP): boolean => {
    let babs: string[] = [];
    for (const section of ip.sections) {
        for (let i = 0; i < section.length - 2; i++) {
            if (section[i] !== section[i+1] && section[i] === section[i+2]) {
                babs.push(`${section[i+1]}${section[i]}${section[i+1]}`);
            }
        }
    }

    for (const hyper of ip.hypernets) {
        for (const bab of babs) {
            if (hyper.includes(bab)) {
                return true;
            }
        }
    }
    return false;
};

export const internetProtocolVersion7 = entryForFile(
    async ({ lines, outputCallback }) => {
        const ips = parseLines(lines);
        const matching = ips.filter(supportsTLS).length;
        await outputCallback(matching);
    },
    async ({ lines, outputCallback }) => {
        const ips = parseLines(lines);
        const matching = ips.filter(supportsSSL).length;
        await outputCallback(matching);
    },
    { key: "internet-protocol-version-7", title: "Internet Protocol Version 7", stars: 2}
);
