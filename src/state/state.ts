export const baseState = {
    dates: {
        year: 2019
    }
};

export function updateYear(year: number | string) {
    console.log("Updating to " + year);
    if (typeof (year) === "string") {
        year = parseInt(year, 10);
    }
    baseState.dates.year = year;
}