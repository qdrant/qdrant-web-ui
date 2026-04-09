import chroma from 'chroma-js';

const SCORE_GRADIENT_COLORS = ['#EB5353', '#F9D923', '#36AE7C'];
const BACKGROUND_COLOR = '#36A2EB';

const DEFAULT_PALETTE = [
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

/**
 * Reduced high-contrast palette: white, orange (#FF9100), cyan (#00E5FF),
 * and greys — chosen for distinguishability across all color vision types
 * including achromatopsia (luminance: white 1.0 > cyan 0.64 > orange 0.42).
 */
const HIGH_CONTRAST_PALETTE = [
  '#FFFFFF',
  '#FF9100',
  '#00E5FF',
  '#C0C0C0',
  '#FFB74D',
  '#66EEFF',
  '#808080',
  '#CC7400',
  '#00B8CC',
  '#E0E0E0',
];

const HIGH_CONTRAST_SCORE_GRADIENT = ['#FF9100', '#FFFFFF', '#00E5FF'];
const HIGH_CONTRAST_BACKGROUND_COLOR = '#FFFFFF';

function colorByPayload(payloadValue, colored, palette) {
  if (colored[payloadValue]) {
    return colored[payloadValue];
  }

  const nextColorIndex = Object.keys(colored).length % palette.length;

  colored[payloadValue] = palette[nextColorIndex];

  return palette[nextColorIndex];
}

// This function generates an array of colors for each point in the chart.
// There are following options available for colorBy:
//
// - None: all points will have the same color
// - typeof = "string": color points based on the source field
// - {"payload": "field_name"}: color points based on the payload field
// - {"discover_score": { ... } }: color points based on the discover score
// - {"query": { ... }}: color points based on the query score

export function generateColorBy(points, colorBy = null, { highContrast = false } = {}) {
  const palette = highContrast ? HIGH_CONTRAST_PALETTE : DEFAULT_PALETTE;
  const scoreGradient = highContrast ? HIGH_CONTRAST_SCORE_GRADIENT : SCORE_GRADIENT_COLORS;
  const defaultBackground = highContrast ? HIGH_CONTRAST_BACKGROUND_COLOR : BACKGROUND_COLOR;

  if (!colorBy) {
    return Array.from({ length: points.length }, () => defaultBackground);
  }

  let resolvedColorBy = colorBy;
  if (typeof colorBy === 'string') {
    resolvedColorBy = { payload: colorBy };
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  if (resolvedColorBy.payload) {
    const valuesToColor = {};

    return points.map((point) => {
      const payloadValue = getNestedValue(point.payload, resolvedColorBy.payload);
      return colorByPayload(payloadValue, valuesToColor, palette);
    });
  }

  if (resolvedColorBy.query) {
    const scores = points.map((point) => point.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    const colorScale = chroma.scale(scoreGradient);
    return scores.map((score) => {
      const normalizedScore = (score - minScore) / (maxScore - minScore);
      return colorScale(normalizedScore).hex();
    });
  }

  return Array.from({ length: points.length }, () => defaultBackground);
}

export function generateSizeBy(points) {
  // ToDo: Intoroduce size differentiation later
  return points.map(() => 3);
}
