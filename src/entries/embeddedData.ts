import reportRepairEmbedded from "../../data/2020/report-repair.txt";
import { reportRepair } from "./single-entries/2020/report-repair";

import passwordPhillosophyEmbedded from "../../data/2020/password-philosophy.txt";
import {passwordPhilosophy} from "./single-entries/2020/password-philosophy";

import tobogganTrajectoryEmbedded from "../../data/2020/toboggan-trajectory.txt";
import { tobogganTrajectory } from './single-entries/2020/toboggan-trajectory';


const parse = (data: string): string[] => data.trim().split("\n");
export const embeddedLines: { [key: string]: string[] } = {
    [reportRepair.metadata!.key]: parse(reportRepairEmbedded),
    [passwordPhilosophy.metadata!.key]: parse(passwordPhillosophyEmbedded),
    [tobogganTrajectory.metadata!.key]: parse(tobogganTrajectoryEmbedded),
};