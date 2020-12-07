import reportRepairEmbedded from "../../data/2020/report-repair.txt";
import { reportRepair } from "./single-entries/2020/report-repair";

import passwordPhillosophyEmbedded from "../../data/2020/password-philosophy.txt";
import {passwordPhilosophy} from "./single-entries/2020/password-philosophy";

import tobogganTrajectoryEmbedded from "../../data/2020/toboggan-trajectory.txt";
import { tobogganTrajectory } from "./single-entries/2020/toboggan-trajectory";

import passportProcessingEmbedded from "../../data/2020/passport-processing.txt";
import {passportProcessing} from "./single-entries/2020/passport-processing";

import { binaryBoarding } from "./single-entries/2020/binary-boarding";
import binaryBoardingEmbedded from "../../data/2020/binary-boarding.txt";

import {customCustoms} from "./single-entries/2020/custom-customs";
import customCustomsEmbedded from "../../data/2020/custom-customs.txt";

import {handyHaversacks} from "./single-entries/2020/handy-haversacks";
import handyHaversacksEmbedded from "../../data/2020/handy-haversacks.txt";


const parse = (data: string): string[] => data.trim().split("\n");
export const embeddedLines: { [key: string]: string[] } = {
    [reportRepair.metadata!.key]: parse(reportRepairEmbedded),
    [passwordPhilosophy.metadata!.key]: parse(passwordPhillosophyEmbedded),
    [tobogganTrajectory.metadata!.key]: parse(tobogganTrajectoryEmbedded),
    [passportProcessing.metadata!.key]: parse(passportProcessingEmbedded),
    [binaryBoarding.metadata!.key]: parse(binaryBoardingEmbedded),
    [customCustoms.metadata!.key]: parse(customCustomsEmbedded),
    [handyHaversacks.metadata!.key]: parse(handyHaversacksEmbedded)
};
