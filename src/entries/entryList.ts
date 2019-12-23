import { Entry } from "./entry";
import { entry as frequencyEntry } from "./single-entries/frequency";
import { entry as inventoryEntry } from "./single-entries/inventory";
import { entry as matterSliceEntry } from "./single-entries/no-matter-how-you-slice-it";
import { entry as reposeRecordEntry } from "./single-entries/repose-record";
import { entry as alchemicalReduction } from "./single-entries/alchemical-reduction";
import { entry as chronalCoordinates } from "./single-entries/chronal-coordinates";
import { entry as sumParts } from "./single-entries/the-sum-of-its-parts";
import { entry as memoryManeuver } from "./single-entries/memory-maneuver";
import { entry as marbleMania } from "./single-entries/marble-mania";
import { entry as starsAlign } from "./single-entries/the-stars-align";
import { entry as chronalCharge } from "./single-entries/chronal-charge";
import { entry as subterranean } from "./single-entries/subterranean";
import { entry as mineCart } from "./single-entries/mine-cart-madness";
import { entry as chocolateCharts } from "./single-entries/chocolate-charts";
import { entry as beverageBandits } from "./single-entries/beverage-bandits";
import { entry as chronalClassification } from "./single-entries/chronal-classification";
import { entry as reservoirResearch } from "./single-entries/reservoir-research";
import { entry as settlers } from "./single-entries/settlers-of-the-north-pole";
import { entry as flow } from "./single-entries/go-with-the-flow";
import { entry as rocketTyranny } from "./single-entries/rocket-tyranny";
import { programAlarm } from './single-entries/program-alarm';
import { crossedWires } from './single-entries/crossed-wires';
import { secureContainer } from './single-entries/secure-container';
import { sunnyAsteroids } from './single-entries/sunny-asteroids';
import { universalObritMap } from './single-entries/universal-orbit-map';
import { amplificationCircuit } from './single-entries/amplification-circuit';
import { spaceImageFormat } from './single-entries/space-image-format';
import { sensorBoost } from './single-entries/sensor-boost';
import { monitoringStation } from './single-entries/monitoring-station';
import { spacePolice } from './single-entries/space-police';
import { nBodyProblem } from './single-entries/n-body-problem';
import { carePackage } from './single-entries/care-package';
import { spaceStoichiometry } from './single-entries/space-stoichiometry';

export interface EntryRoute {
    name: string;
    title: string;
    entry: Entry;
    hasCustomComponent?: boolean;
}

export const entryList: { [key: string]: EntryRoute[] } = {
    "2018": [
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
            entry: mineCart,
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
        }
    ],
    "2019": [
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
        }
    ]
};

