// import reportRepairEmbedded from "../../data/2020/report-repair.txt";
import { reportRepair } from "./single-entries/2020/report-repair";

// import passwordPhillosophyEmbedded from "../../data/2020/password-philosophy.txt";
import {passwordPhilosophy} from "./single-entries/2020/password-philosophy";

// import tobogganTrajectoryEmbedded from "../../data/2020/toboggan-trajectory.txt";
import { tobogganTrajectory } from "./single-entries/2020/toboggan-trajectory";

// import passportProcessingEmbedded from "../../data/2020/passport-processing.txt";
import {passportProcessing} from "./single-entries/2020/passport-processing";

import { binaryBoarding } from "./single-entries/2020/binary-boarding";
// import binaryBoardingEmbedded from "../../data/2020/binary-boarding.txt";

import {customCustoms} from "./single-entries/2020/custom-customs";
// import customCustomsEmbedded from "../../data/2020/custom-customs.txt";

import {handyHaversacks} from "./single-entries/2020/handy-haversacks";
// import handyHaversacksEmbedded from "../../data/2020/handy-haversacks.txt";

import {handheldHalting} from "./single-entries/2020/handheld-halting";
// import handheldHaltingEmbedded from "../../data/2020/handheld-halting.txt";

import {encodingError} from "./single-entries/2020/encoding-error";
import { adapterArray } from "./single-entries/2020/adapter-array";
import { seatingSystem } from "./single-entries/2020/seating-system";
// import encodingErrorEmbedded from "../../data/2020/encoding-error.txt";

const parse = (data: string): string[] => data.trim().split("\n");
export const embeddedLines = [
    reportRepair,
    passwordPhilosophy,
    tobogganTrajectory,
    passportProcessing,
    binaryBoarding,
    customCustoms,
    handyHaversacks,
    handheldHalting,
    encodingError,
    adapterArray,
    seatingSystem
].reduce((acc, next) => {
    acc[next.metadata!.key] = async () => {
        // console.log("Lazy loading (ideally) " + next.metadata!.key);
        const data = (await import(
            /* webpackChunkName: "[request]" */
            `../../data/2020/${next.metadata!.key}.txt`
        )).default as string;
        return parse(data);
    };
    return acc;
}, {} as { [key: string]: () => Promise<string[]>});
// export const embeddedLines: { [key: string]: string[] } = {
//     [reportRepair.metadata!.key]: parse(reportRepairEmbedded),
//     [passwordPhilosophy.metadata!.key]: parse(passwordPhillosophyEmbedded),
//     [tobogganTrajectory.metadata!.key]: parse(tobogganTrajectoryEmbedded),
//     [passportProcessing.metadata!.key]: parse(passportProcessingEmbedded),
//     [binaryBoarding.metadata!.key]: parse(binaryBoardingEmbedded),
//     [customCustoms.metadata!.key]: parse(customCustomsEmbedded),
//     [handyHaversacks.metadata!.key]: parse(handyHaversacksEmbedded),
//     [handheldHalting.metadata!.key]: parse(handheldHaltingEmbedded),
//     [encodingError.metadata!.key]: parse(encodingErrorEmbedded),
// };
