import reportRepairEmbedded from "../../data/2020/report-repair.txt";
import { reportRepair } from "./single-entries/2020/report-repair";

import passwordPhillosophyEmbedded from "../../data/2020/password-philosophy.txt";
import {passwordPhilosophy} from "./single-entries/2020/password-philosophy";


const parse = (data: string): string[] => data.trim().split("\n");
export const embeddedLines: { [key: string]: string[] } = {
    [reportRepair.metadata!.key]: parse(reportRepairEmbedded),
    [passwordPhilosophy.metadata!.key]: parse(passwordPhillosophyEmbedded),
};
