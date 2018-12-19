import Entry from "../entry";
import readLines from "../../support/file-reader";

interface Coordinate {
    x: number,
    y: number
}
interface Rectangle {
    id: number,
    position: Coordinate,
    size: Coordinate
}

type Map = Array<boolean[]>;

let isFirstTime = true;
let parseRectangle = (line: string): Rectangle => {
    let trimmed = line.trim();
    let noSpaces = trimmed.replace(/ /g, "");
    let normalizedDelimiters = noSpaces.replace("#", "").replace("@", " ").replace(":", " ");
    if (isFirstTime) {
        isFirstTime = false;
        console.log(noSpaces);
        console.log(normalizedDelimiters);
    }
    let split = normalizedDelimiters.split(" ");
    let id = parseInt(split[0]);
    let fromCoupleToCoordinate = (s: string, d: string): Coordinate => {
        let split = s.split(d);
        return {
            x: parseInt(split[0]),
            y: parseInt(split[1])
        };
    }
    let position = fromCoupleToCoordinate(split[1], ",");
    let size = fromCoupleToCoordinate(split[2], "x");

    return {
        id,
        position,
        size
    };
}
const entry: Entry = {
    first: () => readLines(lines => {
        let map = mapCreator(lines.map(parseRectangle));

        let total = map.reduce<number>((acc, current) => acc + current.filter(e => e).length, 0);
        console.log(total);
    }),
    second: () => readLines(lines => {
        let rectangles = lines.map(parseRectangle);
        let map = mapCreator(rectangles);

        let candidate = rectangles.find(r => {
            let isCandidate = true;
            executeOnMap(r, (map: Map, coordinate: Coordinate) => {
                if (map[coordinate.x][coordinate.y]) {
                    isCandidate = false;
                }
            }, map);
            return isCandidate;
        });
        console.log(candidate.id);
    })
};

export default entry;

function mapCreator(rectangles: Rectangle[]) {
    let size = 1000;
    let map: Map = new Array<boolean[]>(size);
    for (let i = 0; i < size; i++) {
        map[i] = new Array<boolean>(size);
    }
    let first = rectangles[0];
    console.log(`First Rectangle: ${first.size.x}x${first.size.y}`);
    let callback = (map: Map, coordinate: Coordinate) => {
        if (map[coordinate.x][coordinate.y] === undefined) {
            map[coordinate.x][coordinate.y] = false;
        }
        else {
            map[coordinate.x][coordinate.y] = true;
        }
    }
    rectangles.forEach(r => executeOnMap(r, callback, map));
    return map;

}

function executeOnMap(r: Rectangle, callback: (map: boolean[][], coordinate: Coordinate) => void, map: boolean[][]) {
    for (let i = 0; i < r.size.x; i++) {
        for (let j = 0; j < r.size.y; j++) {
            let coordinate: Coordinate = {
                x: i + r.position.x,
                y: j + r.position.y
            };
            callback(map, coordinate);
        }
    }
}

