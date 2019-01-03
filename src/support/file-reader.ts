import { error } from "./log";
export function readFileFromInput(file: File, onSuccess: ((content: string) => void)) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
        onSuccess(fileReader.result as string);
    };
    fileReader.onerror = () => {
        error("File read failure");
    };
    fileReader.readAsText(file);
}


export default (callback: (lines: string[]) => void) => {
    const lines: string[] = [];
    callback(lines);
};
