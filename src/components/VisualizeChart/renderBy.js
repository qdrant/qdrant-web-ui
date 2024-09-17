import chroma from 'chroma-js';

const SCORE_GRADIENT_COLORS = ['#EB5353', '#F9D923', '#36AE7C'];
const BACKGROUND_COLOR = '#36A2EB';


const PALLETE = [
    "#a35",
    "#4d8",
    "#0bc",
    "#36b",
    "#ed0",
    "#e94",
    "#9d5",
    "#2cb",
    "#c66",
    "#09c",
]

// const SELECTED_BORDER_COLOR = '#881177';


function colorByPayload(payloadValue, colored) {
    if (colored[payloadValue]) {
        return colored[payloadValue];
    }

    const nextColorIndex = Object.keys(colored).length % PALLETE.length;

    colored[payloadValue] = PALLETE[nextColorIndex];

    return PALLETE[nextColorIndex];
}


// This function generates an array of colors for each point in the chart.
// There are following options available for colorBy:
// 
// - None: all points will have the same color
// - {"payload": "field_name"}: color points based on the payload field
// - {"discover_score": { ... } }: color points based on the discover score
// - {"query": { ... }}: color points based on the query score


export function generateColorBy(points, colorBy = null) {

    // Points example:
    // [
    //     { id: 0, payload: { field_name: 1 }, score: 0.5, vector: [0.1, 0.2, ....] },
    //     { id: 1, payload: { field_name: 2 }, score: 0.6, vector: [0.3, 0.4, ....] },
    //     ...
    // ]

    if (!colorBy) {
        return Array.from({ length: points.length }, () => BACKGROUND_COLOR ); // Default color
    }

    if (colorBy.payload) {
        const valuesToColor = {};

        return points.map((point) => {
            const payloadValue = point.payload[colorBy.payload];
            if (!payloadValue) {
                return BACKGROUND_COLOR;
            }
            return colorByPayload(payloadValue, valuesToColor);
        });
    }

    if (colorBy.discover_score || colorBy.query) {
        const scores = points.map((point) => point.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);

        const colorScale = chroma.scale(SCORE_GRADIENT_COLORS);
        return scores.map((score) => {
            const normalizedScore = (score - minScore) / (maxScore - minScore);
            return colorScale(normalizedScore).hex();
        });
    }
}

export function generateSizeBy(points) {
    // ToDo: Intoroduce size differentiation later
    return points.map(() => 3);
}