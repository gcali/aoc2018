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
import { immuneSystemSimulator20XX } from './single-entries/2018/immune-system-simulator-20xx';
import { fourDimensionalAdventure } from './single-entries/2018/four-dimensional-adventure';

export interface EntryRoute extends EntryRouteBase {
    date: number;
}

interface EntryRouteBase {
    name: string;
    title: string;
    entry: Entry;
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
            entry: inverseCaptcha
        },
        {
            name: "corruption-checksum",
            title: "Corruption Checksum",
            entry: corruptionChecksum
        },
        {
            name: "spiral-memory",
            title: "Spiral Memory",
            entry: spiralMemory
        },
        {
            name: "high-entropy-passphrases",
            title: "High-Entropy Passphrases",
            entry: highEntropyPasshprases
        },
        {
            name: "a-maze-of-twisty-trampolines-all-alike",
            title: "A Maze of Twisty Trampolines, All Alike",
            entry: aMazeOfTwistyTrampolinesAllAlike
        },
        {
            name: "memory-reallocation",
            title: "Memory Reallocation",
            entry: memoryReallocation
        },
        {
            name: "recursive-circus",
            title: "Recursive Circus",
            entry: recursiveCircus
        },
        {
            name: "heard-you-like-registers",
            title: "I Heard You Like Registers",
            entry: heardYouLikeRegisters
        },
        {
            name: "stream-processing",
            title: "Stream Processing",
            entry: streamProcessing
        },
        {
            name: "knoth-hash",
            title: "Knot Hash",
            entry: knotHash
        },
        {
            name: "hex-ed",
            title: "Hex Ed",
            entry: hexEd
        },
        {
            name: "digital-plumber",
            title: "Digital Plumber",
            entry: digitalPlumber
        },
        {
            name: "packet-scanners",
            title: "Packet Scanners",
            entry: packetScanners
        },
        {
            name: "disk-defragmentation",
            title: "Disk Defragmentation",
            entry: diskDefragmentation
        },
        {
            name: "dueling-generators",
            title: "Dueling Generators",
            entry: duelingGenerators
        },
        {
            name: "permutation-promenade",
            title: "Permutation Promenade",
            entry: permutationPromenade
        },
        {
            name: "spinlock",
            title: "Spinlock",
            entry: spinlock
        },
        {
            name: "duet",
            title: "Duet",
            entry: duet
        },
        {
            name: "a-series-of-tubes",
            title: "A Series of Tubes",
            entry: aSeriesOfTubes
        },
        {
            name: "particle-swarm",
            title: "Particle Swarm",
            entry: particleSwarm
        },
        {
            name: "fractal-art",
            title: "Fractal Art",
            entry: fractalArt
        },
        {
            name: "sporifica-virus",
            title: "Sporifica Virus",
            entry: sporificaVirus,
        },
        {
            name: "coprocessor-conflagration",
            title: "Coprocessor Conflagration",
            entry: coprocessorConflagration
        },
        {
            name: "electromagnetic-moat",
            title: "Electromagnetic Moat",
            entry: electromagneticMoat
        },
        {
            name: "the-halting-problem",
            title: "The Halting Problem",
            entry: haltingProblem
        }
    ]),
    2018: enrichList([
        {
            name: "frequency",
            title: "Chronal Calibration",
            entry: frequencyEntry
        },
        {
            name: "inventory",
            title: "Inventory Management System",
            entry: inventoryEntry
        },
        {
            name: "no-matter-how-you-slice-it",
            title: "No Matter How You Slice It",
            entry: matterSliceEntry
        },
        {
            name: "repose-record",
            title: "Repose Record",
            entry: reposeRecordEntry
        },
        {
            name: "alchemical-reduction",
            title: "Alchemical Reduction",
            entry: alchemicalReduction
        },
        {
            name: "chronal-coordinates",
            title: "Chronal Coordinates",
            entry: chronalCoordinates
        },
        {
            name: "the-sum-of-its-parts",
            title: "The Sum of Its Parts",
            entry: sumParts
        },
        {
            name: "memory-maneuver",
            title: "Memory Maneuver",
            entry: memoryManeuver
        },
        {
            name: "marble-mania",
            title: "Marble Mania",
            entry: marbleMania
        },
        {
            name: "stars-align",
            title: "The Stars Align",
            entry: starsAlign
        },
        {
            name: "chronal-charge",
            title: "Chronal Charge",
            entry: chronalCharge
        },
        {
            name: "subterranean",
            title: "Subterranean Substainability",
            entry: subterranean
        },
        {
            name: "mine-cart-madness",
            title: "Mine Cart Madness",
            entry: mineCartMadness,
            hasCustomComponent: true
        },
        {
            name: "chocolate-charts",
            title: "Chocolate Charts",
            entry: chocolateCharts
        },
        {
            name: "beverage-bandits",
            title: "Beverage Bandits",
            entry: beverageBandits
        },
        {
            name: "chronal-classification",
            title: "Chronal Classification",
            entry: chronalClassification
        },
        {
            name: "reservoir-research",
            title: "Reservoir Research",
            entry: reservoirResearch
        },
        {
            name: "settlers-of-the-north-pole",
            title: "Settlers of the North Pole",
            entry: settlers,
            hasCustomComponent: true
        },
        {
            name: "go-with-the-flow",
            title: "Go with the flow",
            entry: flow,
            hasCustomComponent: true
        },
        {
            name: "a-regular-map",
            title: "A Regular Map",
            entry: aRegularMap
        },
        {
            name: "chronal-conversion",
            title: "Chronal Conversion",
            entry: chronalConversion
        },
        {
            name: "mode-maze",
            title: "Mode Maze",
            entry: modeMaze
        },
        {
            name: "experimental-emergency-transportation",
            title: "Experimental Emergency Transportation",
            entry: experimentalEmergencyTransportation
        },
        {
            name: "immune-system-simulator-20xx",
            title: "Immune System Simulator 20XX",
            entry: immuneSystemSimulator20XX
        },
        {
            name: "four-dimensional-adventure",
            title: "Four-Dimensional Adventure",
            entry: fourDimensionalAdventure
        }
    ]),
    2019: enrichList([
        {
            name: "rocket-tyranny",
            title: "The Tyranny of the Rocket Equation",
            entry: rocketTyranny
        },
        {
            name: "program-alarm",
            title: "1202 Program Alarm",
            entry: programAlarm
        },
        {
            name: "corssed-wires",
            title: "Crossed Wires",
            entry: crossedWires
        },
        {
            name: "secure-container",
            title: "Secure Container",
            entry: secureContainer
        },
        {
            name: "sunny-asteroids",
            title: "Sunny with a Change of Asteroids",
            entry: sunnyAsteroids
        },
        {
            name: "universal-orbit-map",
            title: "Universal Orbit Map",
            entry: universalObritMap
        },
        {
            name: "amplification-circuit",
            title: "Amplification Circuit",
            entry: amplificationCircuit
        },
        {
            name: "space-image-format",
            title: "Space Image Format",
            entry: spaceImageFormat
        },
        {
            name: "sensor-boost",
            title: "Sensor Boost",
            entry: sensorBoost
        },
        {
            name: "monitoring-station",
            title: "Monitoring Station",
            entry: monitoringStation
        },
        {
            name: "space=police",
            title: "Space Police",
            entry: spacePolice
        },
        {
            name: "n-body-problem",
            title: "N-Body Problem",
            entry: nBodyProblem
        },
        {
            name: "care-package",
            title: "Care Package",
            entry: carePackage
        },
        {
            name: "space-stoichiometry",
            title: "Space Stoichiometry",
            entry: spaceStoichiometry
        },
        {
            name: "oxygen-system",
            title: "Oxygen System",
            entry: oxygenSystem
        },
        {
            name: "flawed-frequency-transmission",
            title: "Flawed Frequency Transmission",
            entry: flawedFrequencyTransmission
        },
        {
            name: "set-and-forget",
            title: "Set and Forget",
            entry: setAndForget
        },
        {
            name: "many-world-interpretation",
            title: "Many World Interpretation",
            entry: manyWorldInterpretation
        },
    ])
};

