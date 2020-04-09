export const serializeTime = (ms: number): string => {
    let seconds = Math.ceil(ms/1000);
    let minutes = 0;
    let hours = 0;
    if (seconds > 0) {
        minutes = Math.ceil(seconds/60);
        seconds = seconds % 60;
    }
    if (minutes > 60) {
        hours = Math.ceil(minutes/60);
        minutes = minutes % 60;
    }
    const result = [hours,minutes,seconds].map(e => e.toString().padStart(2,"0")).join(":");
    return result; 

}