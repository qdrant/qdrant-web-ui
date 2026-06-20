import chroma from 'chroma-js';

const SCORE_GRADIENT_COLORS = ['#EB5353', '#F9D923', '#36AE7C'];
const BACKGROUND_COLOR = '#36A2EB';

const PALLETE = [
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#3B3EAC',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
  '#994499',
  '#22AA99',
  '#AAAA11',
  '#6633CC',
  '#E67300',
  '#8B0707',
  '#329262',
  '#5574A6',
  '#651067',
];

function colorByPayload(payloadValue, colored) {
  if (payloadValue === undefined || payloadValue === null) {
    return BACKGROUND_COLOR;
  }

  if (colored[payloadValue]) {
    return colored[payloadValue];
  }

  const nextColorIndex = Object.keys(colored).length % PALLETE.length;
  colored[payloadValue] = PALLETE[nextColorIndex];

  return PALLETE[nextColorIndex];
}

// --------------------------------------------------
// COLOR GENERATION
// --------------------------------------------------

export function generateColorBy(points, colorBy = null) {
  if (!points || points.length === 0) {
    return [];
  }

  // Default: single color
  if (!colorBy) {
    return Array.from({ length: points.length }, () => BACKGROUND_COLOR);
  }

  // If `colorBy` is a string → payload field
  if (typeof colorBy === 'string') {
    colorBy = { payload: colorBy };
  }

  function getNestedValue(obj, path) {
    if (!obj) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // -------------------------------
  // Payload-based coloring
  // -------------------------------
  if (colorBy.payload) {
    const valuesToColor = {};

    return points.map((point) => {
      const payloadValue = getNestedValue(point.payload, colorBy.payload);
      return colorByPayload(payloadValue, valuesToColor);
    });
  }

  // -------------------------------
  // Score-based coloring
  // (query / discover / HNSW-safe)
  // -------------------------------
  if (colorBy.query) {
    const scores = points
      .map((point) => point.score)
      .filter((score) => typeof score === 'number');

    if (scores.length === 0) {
      return Array.from({ length: points.length }, () => BACKGROUND_COLOR);
    }

    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Avoid division by zero
    if (minScore === maxScore) {
      return Array.from({ length: points.length }, () => SCORE_GRADIENT_COLORS[1]);
    }

    const colorScale = chroma.scale(SCORE_GRADIENT_COLORS);

    return points.map((point) => {
      if (typeof point.score !== 'number') {
        return BACKGROUND_COLOR;
      }

      const normalizedScore = (point.score - minScore) / (maxScore - minScore);
      return colorScale(normalizedScore).hex();
    });
  }

  // Fallback
  return Array.from({ length: points.length }, () => BACKGROUND_COLOR);
}

// --------------------------------------------------
// SIZE GENERATION
// --------------------------------------------------

export function generateSizeBy(points) {
  if (!points || points.length === 0) {
    return [];
  }

  // HNSW-safe default
  return points.map(() => 3);
}
