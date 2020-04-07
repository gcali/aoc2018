import { Entry } from "./entry";
import { entry as frequencyEntry } from "./single-entries/2018/frequency";
import { entry as inventoryEntry } from "./single-entries/2018/inventory";
import { entry as matterSliceEntry } from "./single-entries/2018/no-matter-how-you-slice-it";
import { entry as reposeRecordEntry } from "./single-entries/2018/repose-record";
import { entry as alchemicalReduction } from "./single-entries/2018/alchemical-reduction";
import { entry as chronalCoordinates } from "./single-entries/2018/chronal-coordinates";
import { entry as sumParts } from "./single-entries/2018/the-sum-of-its-parts";
import { entry as memoryManeuver } from "./single-entries/2018/memory-maneuver";
import { entry as marbleMania } from "./single-entries/2018/marble-mania";
import { entry as starsAlign } from "./single-entries/2018/the-stars-align";
import { entry as chronalCharge } from "./single-entries/2018/chronal-charge";
import { entry as subterranean } from "./single-entries/2018/subterranean";
import { mineCartMadness } from "./single-entries/2018/mine-cart-madness";
import { entry as chocolateCharts } from "./single-entries/2018/chocolate-charts";
import { entry as beverageBandits } from "./single-entries/2018/beverage-bandits";
import { entry as chronalClassification } from "./single-entries/2018/chronal-classification";
import { entry as reservoirResearch } from "./single-entries/2018/reservoir-research";
import { entry as settlers } from "./single-entries/2018/settlers-of-the-north-pole";
import { entry as flow } from "./single-entries/2018/go-with-the-flow";
import { entry as rocketTyranny } from "./single-entries/2019/rocket-tyranny";
import { programAlarm } from "./single-entries/2019/program-alarm";
import { crossedWires } from "./single-entries/2019/crossed-wires";
import { secureContainer } from "./single-entries/2019/secure-container";
import { sunnyAsteroids } from "./single-entries/2019/sunny-asteroids";
import { universalObritMap } from "./single-entries/2019/universal-orbit-map";
import { amplificationCircuit } from "./single-entries/2019/amplification-circuit";
import { spaceImageFormat } from "./single-entries/2019/space-image-format";
import { sensorBoost } from "./single-entries/2019/sensor-boost";
import { monitoringStation } from "./single-entries/2019/monitoring-station";
import { spacePolice } from "./single-entries/2019/space-police";
import { nBodyProblem } from "./single-entries/2019/n-body-problem";
import { carePackage } from "./single-entries/2019/care-package";
import { spaceStoichiometry } from "./single-entries/2019/space-stoichiometry";
import { oxygenSystem } from "./single-entries/2019/oxygen-system";
import { flawedFrequencyTransmission } from "./single-entries/2019/flawed-frequency-transmission";
import { setAndForget } from "./single-entries/2019/set-and-forget";
import { manyWorldInterpretation } from "./single-entries/2019/many-worlds-interpretation";
import { inverseCaptcha } from "./single-entries/2017/inverse-captcha";
import { aRegularMap } from "./single-entries/2018/a-regular-map";
import { corruptionChecksum } from "./single-entries/2017/corruption-checksum";
import { spiralMemory } from "./single-entries/2017/spiral-memory";
import { highEntropyPasshprases } from "./single-entries/2017/high-entropy-passhprases";
import { aMazeOfTwistyTrampolinesAllAlike } from "./single-entries/2017/a-maze-of-twisty-trampolines-all-alike";
import { memoryReallocation } from "./single-entries/2017/memory-reallocation";
import { recursiveCircus } from "./single-entries/2017/recursive-circus";
import { heardYouLikeRegisters } from "./single-entries/2017/heard-you-like-registers";
import { streamProcessing } from "./single-entries/2017/stream-processing";
import { knotHash } from "./single-entries/2017/knot-hash";
import { hexEd } from "./single-entries/2017/hex-ed";
import { digitalPlumber } from "./single-entries/2017/digital-plumber";
import { packetScanners } from "./single-entries/2017/packet-scanners";
import { diskDefragmentation } from "./single-entries/2017/disk-defragmentation";
import { duelingGenerators } from "./single-entries/2017/dueling-generators";
import { permutationPromenade } from "./single-entries/2017/permutation-promenade";
import { spinlock } from "./single-entries/2017/spinlock";
import { duet } from "./single-entries/2017/duet";
import { aSeriesOfTubes } from "./single-entries/2017/a-series-of-tubes";
import { particleSwarm } from "./single-entries/2017/particle-swarm";
import { fractalArt } from "./single-entries/2017/fractal-art";
import { sporificaVirus } from "./single-entries/2017/sporifica-virus";
import { coprocessorConflagration } from "./single-entries/2017/coprocessor-conflagration";
import { electromagneticMoat } from "./single-entries/2017/electromagnetic-moat";
import { haltingProblem } from "./single-entries/2017/the-halting-problem";
import { chronalConversion } from "./single-entries/2018/chronal-conversion";
import { modeMaze } from "./single-entries/2018/mode-maze";
import { experimentalEmergencyTransportation } from "./single-entries/2018/experimental-emergency-transportation";
import { immuneSystemSimulator20XX } from "./single-entries/2018/immune-system-simulator-20xx";
import { fourDimensionalAdventure } from "./single-entries/2018/four-dimensional-adventure";

export interface EntryRoute extends EntryRouteBase {
    date: number;
}

interface EntryRouteBase {
    name: string;
    title: string;
    entry: Entry;
    stars?: 1 | 2;
    hasCustomComponent?: boolean;
}

function enrichList(entries: EntryRouteBase[]): EntryRoute[] {
    return entries.map((e, index) => ({ ...e, date: index + 1 }));
}


export const entryList: { [key: string]: EntryRoute[] } = {
    2017: enrichList([
        {
            name: "inverse-captcha",
            title: "Inverse Captcha",
            entry: inverseCaptcha,
            stars: 2,
        },
        {
            name: "corruption-checksum",
            title: "Corruption Checksum",
            entry: corruptionChecksum,
            stars: 2,
        },
        {
            name: "spiral-memory",
            title: "Spiral Memory",
            entry: spiralMemory,
            stars: 2,
        },
        {
            name: "high-entropy-passphrases",
            title: "High-Entropy Passphrases",
            entry: highEntropyPasshprases,
            stars: 2,
        },
        {
            name: "a-maze-of-twisty-trampolines-all-alike",
            title: "A Maze of Twisty Trampolines, All Alike",
            entry: aMazeOfTwistyTrampolinesAllAlike,
            stars: 2,
        },
        {
            name: "memory-reallocation",
            title: "Memory Reallocation",
            entry: memoryReallocation,
            stars: 2,
        },
        {
            name: "recursive-circus",
            title: "Recursive Circus",
            entry: recursiveCircus,
            stars: 2,
        },
        {
            name: "heard-you-like-registers",
            title: "I Heard You Like Registers",
            entry: heardYouLikeRegisters,
            stars: 2,
        },
        {
            name: "stream-processing",
            title: "Stream Processing",
            entry: streamProcessing,
            stars: 2,
        },
        {
            name: "knoth-hash",
            title: "Knot Hash",
            entry: knotHash,
            stars: 2,
        },
        {
            name: "hex-ed",
            title: "Hex Ed",
            entry: hexEd,
            stars: 2,
        },
        {
            name: "digital-plumber",
            title: "Digital Plumber",
            entry: digitalPlumber,
            stars: 2,
        },
        {
            name: "packet-scanners",
            title: "Packet Scanners",
            entry: packetScanners,
            stars: 2,
        },
        {
            name: "disk-defragmentation",
            title: "Disk Defragmentation",
            entry: diskDefragmentation,
            stars: 2,
        },
        {
            name: "dueling-generators",
            title: "Dueling Generators",
            entry: duelingGenerators,
            stars: 2,
        },
        {
            name: "permutation-promenade",
            title: "Permutation Promenade",
            entry: permutationPromenade,
            stars: 2,
        },
        {
            name: "spinlock",
            title: "Spinlock",
            entry: spinlock,
            stars: 2,
        },
        {
            name: "duet",
            title: "Duet",
            entry: duet,
            stars: 2,
        },
        {
            name: "a-series-of-tubes",
            title: "A Series of Tubes",
            entry: aSeriesOfTubes,
            stars: 2,
        },
        {
            name: "particle-swarm",
            title: "Particle Swarm",
            entry: particleSwarm,
            stars: 2,
        },
        {
            name: "fractal-art",
            title: "Fractal Art",
            entry: fractalArt,
            stars: 2,
        },
        {
            name: "sporifica-virus",
            title: "Sporifica Virus",
            entry: sporificaVirus,
            stars: 2,
        },
        {
            name: "coprocessor-conflagration",
            title: "Coprocessor Conflagration",
            entry: coprocessorConflagration,
            stars: 2,
        },
        {
            name: "electromagnetic-moat",
            title: "Electromagnetic Moat",
            entry: electromagneticMoat,
            stars: 2,
        },
        {
            name: "the-halting-problem",
            title: "The Halting Problem",
            entry: haltingProblem,
            stars: 2,
        }
    ]),
    2018: enrichList([
        {
            name: "frequency",
            title: "Chronal Calibration",
            entry: frequencyEntry,
            stars: 2,
        },
        {
            name: "inventory",
            title: "Inventory Management System",
            entry: inventoryEntry,
            stars: 2,
        },
        {
            name: "no-matter-how-you-slice-it",
            title: "No Matter How You Slice It",
            entry: matterSliceEntry,
            stars: 2,
        },
        {
            name: "repose-record",
            title: "Repose Record",
            entry: reposeRecordEntry,
            stars: 2,
        },
        {
            name: "alchemical-reduction",
            title: "Alchemical Reduction",
            entry: alchemicalReduction,
            stars: 2,
        },
        {
            name: "chronal-coordinates",
            title: "Chronal Coordinates",
            entry: chronalCoordinates,
            stars: 2,
        },
        {
            name: "the-sum-of-its-parts",
            title: "The Sum of Its Parts",
            entry: sumParts,
            stars: 2,
        },
        {
            name: "memory-maneuver",
            title: "Memory Maneuver",
            entry: memoryManeuver,
            stars: 2,
        },
        {
            name: "marble-mania",
            title: "Marble Mania",
            entry: marbleMania,
            stars: 2,
        },
        {
            name: "stars-align",
            title: "The Stars Align",
            entry: starsAlign,
            stars: 2,
        },
        {
            name: "chronal-charge",
            title: "Chronal Charge",
            entry: chronalCharge,
            stars: 2,
        },
        {
            name: "subterranean",
            title: "Subterranean Substainability",
            entry: subterranean,
            stars: 2,
        },
        {
            name: "mine-cart-madness",
            title: "Mine Cart Madness",
            entry: mineCartMadness,
            hasCustomComponent: true,
            stars: 2,
        },
        {
            name: "chocolate-charts",
            title: "Chocolate Charts",
            entry: chocolateCharts,
            stars: 2,
        },
        {
            name: "beverage-bandits",
            title: "Beverage Bandits",
            entry: beverageBandits,
            stars: 2,
        },
        {
            name: "chronal-classification",
            title: "Chronal Classification",
            entry: chronalClassification,
            stars: 2,
        },
        {
            name: "reservoir-research",
            title: "Reservoir Research",
            entry: reservoirResearch,
            stars: 2,
        },
        {
            name: "settlers-of-the-north-pole",
            title: "Settlers of the North Pole",
            entry: settlers,
            hasCustomComponent: true,
            stars: 2,
        },
        {
            name: "go-with-the-flow",
            title: "Go with the flow",
            entry: flow,
            hasCustomComponent: true,
            stars: 2,
        },
        {
            name: "a-regular-map",
            title: "A Regular Map",
            entry: aRegularMap,
            stars: 2,
        },
        {
            name: "chronal-conversion",
            title: "Chronal Conversion",
            entry: chronalConversion,
            stars: 2,
        },
        {
            name: "mode-maze",
            title: "Mode Maze",
            entry: modeMaze,
            stars: 2,
        },
        {
            name: "experimental-emergency-transportation",
            title: "Experimental Emergency Transportation",
            entry: experimentalEmergencyTransportation,
            stars: 2,
        },
        {
            name: "immune-system-simulator-20xx",
            title: "Immune System Simulator 20XX",
            entry: immuneSystemSimulator20XX,
            stars: 2,
        },
        {
            name: "four-dimensional-adventure",
            title: "Four-Dimensional Adventure",
            entry: fourDimensionalAdventure,
            stars: 2,
        }
    ]),
    2019: enrichList([
        {
            name: "rocket-tyranny",
            title: "The Tyranny of the Rocket Equation",
            entry: rocketTyranny,
            stars: 2,
        },
        {
            name: "program-alarm",
            title: "1202 Program Alarm",
            entry: programAlarm,
            stars: 2,
        },
        {
            name: "corssed-wires",
            title: "Crossed Wires",
            entry: crossedWires,
            stars: 2,
        },
        {
            name: "secure-container",
            title: "Secure Container",
            entry: secureContainer,
            stars: 2,
        },
        {
            name: "sunny-asteroids",
            title: "Sunny with a Change of Asteroids",
            entry: sunnyAsteroids,
            stars: 2,
        },
        {
            name: "universal-orbit-map",
            title: "Universal Orbit Map",
            entry: universalObritMap,
            stars: 2,
        },
        {
            name: "amplification-circuit",
            title: "Amplification Circuit",
            entry: amplificationCircuit,
            stars: 2,
        },
        {
            name: "space-image-format",
            title: "Space Image Format",
            entry: spaceImageFormat,
            stars: 2,
        },
        {
            name: "sensor-boost",
            title: "Sensor Boost",
            entry: sensorBoost,
            stars: 2,
        },
        {
            name: "monitoring-station",
            title: "Monitoring Station",
            entry: monitoringStation,
            stars: 2,
        },
        {
            name: "space=police",
            title: "Space Police",
            entry: spacePolice,
            stars: 2,
        },
        {
            name: "n-body-problem",
            title: "N-Body Problem",
            entry: nBodyProblem,
            stars: 2,
        },
        {
            name: "care-package",
            title: "Care Package",
            entry: carePackage,
            stars: 2,
        },
        {
            name: "space-stoichiometry",
            title: "Space Stoichiometry",
            entry: spaceStoichiometry,
            stars: 2
        },
        {
            name: "oxygen-system",
            title: "Oxygen System",
            entry: oxygenSystem,
            stars: 2,
        },
        {
            name: "flawed-frequency-transmission",
            title: "Flawed Frequency Transmission",
            entry: flawedFrequencyTransmission,
            stars: 1,
        },
        {
            name: "set-and-forget",
            title: "Set and Forget",
            entry: setAndForget,
            stars: 1,
        },
        {
            name: "many-world-interpretation",
            title: "Many World Interpretation",
            entry: manyWorldInterpretation,
        },
    ])
};

