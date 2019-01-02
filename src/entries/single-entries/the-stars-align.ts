import { entryForFile } from '../entry';
import { Coordinate, sumCoordinate, getBoundaries, Bounds } from '../../support/geometry';
import { writeImgFromPoints } from '../../support/output';

class MovablePoint {

    public static FromLine(line: string): MovablePoint {
        line = line.replace(/ /g, '');
        const firstPart = line.slice(line.indexOf('<') + 1, line.indexOf('>'));
        let secondPart = line.slice(line.indexOf('>') + 1);
        secondPart = secondPart.slice(secondPart.indexOf('<') + 1, secondPart.indexOf('>'));
        console.log(secondPart);
        const coordinateTokens = firstPart.split(',');
        const speedTokens = secondPart.split(',');
        return new MovablePoint(
            {
                x: parseInt(coordinateTokens[0], 10),
                y: parseInt(coordinateTokens[1], 10),
            },
            {
                x: parseInt(speedTokens[0], 10),
                y: parseInt(speedTokens[1], 10),
            },
        );

    }
    constructor(
        public coordinates: Coordinate,
        public speed: Coordinate,
    ) {

    }

    public move(): MovablePoint {
        return new MovablePoint(
            sumCoordinate(this.coordinates, this.speed),
            this.speed,
        );
    }
}

const entry = entryForFile(
    (lines) => {
        let points = lines.map((line) => MovablePoint.FromLine(line));
        let lastBoundaries: Bounds | null = null;
        let done = false;
        function getArea(size: Coordinate) {
            return size.x * size.y;
        }
        while (!done) {
            const newPoints = points.map((p) => p.move());
            const boundaries = getBoundaries(newPoints.map((p) => p.coordinates));
            if (lastBoundaries === null) {
                lastBoundaries = boundaries;
            } else if (lastBoundaries.size.x < boundaries.size.x &&
                lastBoundaries.size.y < boundaries.size.y) {
                console.log(lastBoundaries);
                writeImgFromPoints(
                    'stars.png',
                    lastBoundaries,
                    points.map((p) => ({
                        color: 0xff0000ff,
                        coordinates: p.coordinates,
                    })),
                    0.001,
                    0x000000ff,
                );
                done = true;
            }
            points = newPoints;
        }

    },
    (lines) => {
        throw Error('Not implemented');
    },
);

export default entry;
