import reportRepairEmbedded from "../../data/2020/report-repair.txt";
import { reportRepair } from "./single-entries/2020/report-repair";


const parse = (data: string): string[] => data.trim().split("\n");
export const init = () => {
    embeddedLines[reportRepair.metadata!.key] = parse(reportRepairEmbedded);
};

export const embeddedLines: { [key: string]: string[] } = {

};
