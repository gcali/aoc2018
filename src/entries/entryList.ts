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
import { tractorBeam } from './single-entries/2019/tractor-beam';
import { donutMaze } from './single-entries/2019/donut-maze';
import { springdroidAdventure } from './single-entries/2019/springroid-adventure';
import { slamShuffle } from './single-entries/2019/slam-shuffle';
import { categorySix } from './single-entries/2019/category-six';
import { planetOfDiscord } from './single-entries/2019/planet-of-discord';

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

interface EntryRouteCustom {
    entry: Entry;
    hasCustomComponent: true
}

const isEntryRouteBase = (e: Entry | EntryRouteBase | EntryRouteCustom): e is EntryRouteBase => {
    return (e as EntryRouteBase).name !== undefined;
}

const isEntryRouteCustom = (e: Entry | EntryRouteCustom): e is EntryRouteCustom => {
    return (e as EntryRouteCustom).hasCustomComponent === true;
}

function enrichList(entries: (EntryRouteBase | Entry | EntryRouteCustom)[]): EntryRoute[] {
    return entries.map((e, index) => {
        if (isEntryRouteBase(e)) {
            return { ...e, date: index + 1 };
        } else {
            const entry = isEntryRouteCustom(e) ? e.entry : e;
            const hasCustomComponent = isEntryRouteCustom(e) && e.hasCustomComponent;
            if (entry.metadata === undefined) {
                throw new Error("Entry must have metadata if not specified in here");
            }
            return {
                name: entry.metadata.key,
                title: entry.metadata.title,
                stars: entry.metadata.stars,
                date: index + 1,
                entry: entry,
                hasCustomComponent
            };
        }
    });
}


export const entryList: { [key: string]: EntryRoute[] } = {
    2017: enrichList([
        inverseCaptcha,
        corruptionChecksum,
        spiralMemory,
        highEntropyPasshprases,
        aMazeOfTwistyTrampolinesAllAlike,
        memoryReallocation,
        recursiveCircus,
        heardYouLikeRegisters,
        streamProcessing,
        knotHash,
        hexEd,
        digitalPlumber,
        packetScanners,
        diskDefragmentation,
        duelingGenerators,
        permutationPromenade,
        spinlock,
        duet,
        aSeriesOfTubes,
        particleSwarm,
        fractalArt,
        sporificaVirus,
        coprocessorConflagration,
        electromagneticMoat,
        haltingProblem,
    ]),
    2018: enrichList([
        frequencyEntry,
        inventoryEntry,
        matterSliceEntry,
        reposeRecordEntry,
        alchemicalReduction,
        chronalCoordinates,
        sumParts,
        memoryManeuver,
        marbleMania,
        starsAlign,
        chronalCharge,
        subterranean,
        {
            entry: mineCartMadness,
            hasCustomComponent: true
        },
        chocolateCharts,
        beverageBandits,
        chronalClassification,
        reservoirResearch,
        {
            entry: settlers,
            hasCustomComponent: true,
        },
        {
            entry: flow,
            hasCustomComponent: true
        },
        aRegularMap,
        chronalConversion,
        modeMaze,
        experimentalEmergencyTransportation,
        immuneSystemSimulator20XX,
        fourDimensionalAdventure,
    ]),
    2019: enrichList([
        rocketTyranny,
        programAlarm,
        crossedWires,
        secureContainer,
        sunnyAsteroids,
        universalObritMap,
        amplificationCircuit,
        spaceImageFormat,
        sensorBoost,
        monitoringStation,
        spacePolice,
        nBodyProblem,
        carePackage,
        spaceStoichiometry,
        oxygenSystem,
        flawedFrequencyTransmission,
        setAndForget,
        manyWorldInterpretation,
        tractorBeam,
        donutMaze,
        springdroidAdventure,
        slamShuffle,
        categorySix,
        planetOfDiscord
    ])
};

