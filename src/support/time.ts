export const serializeTime = (ms: number): string => {
    let seconds = Math.ceil(ms / 1000);
    let minutes = 0;
    let hours = 0;
    let days = 0;
    if (seconds > 0) {
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
    }
    if (minutes > 60) {
        hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
    }
    if (hours > 24) {
        days = Math.floor(hours / 24);
        hours = hours % 24;
    }
    let result = [hours, minutes, seconds].map((e) => e.toString().padStart(2, "0")).join(":");
    if (days > 0) {
        result = `${days}d ${result}`;
    }
    return result;

};
