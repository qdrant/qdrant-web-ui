import { lightGreen, deepOrange, blue } from './colors';

// Creates a Prism theme object compatible with prism-react-renderer
// Accepts MUI `theme` so colors can adapt to light/dark/high-contrast mode
export default function createPrismTheme(theme) {
  const hc = theme.palette.highContrast;
  const commentColor = hc ? theme.palette.text.secondary : lightGreen[300];
  const stringColor = hc ? '#FF9100' : deepOrange[300];
  const keywordColor = hc ? theme.palette.text.primary : blue[500];
  const valueColor = hc ? '#00E5FF' : lightGreen[300];

  return {
    plain: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.code,
    },
    styles: [
      {
        types: ['comment', 'prolog', 'doctype', 'cdata'],
        style: {
          color: commentColor,
          fontStyle: 'italic',
        },
      },
      {
        types: ['string', 'attr-value'],
        style: {
          color: stringColor,
        },
      },
      {
        types: ['punctuation', 'operator'],
        style: {
          color: theme.palette.text.primary,
        },
      },
      {
        types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable', 'constant', 'regex', 'inserted'],
        style: {
          color: valueColor,
        },
      },
      {
        types: ['property'],
        style: {
          color: theme.palette.secondary.main,
        },
      },
      {
        types: ['atrule', 'keyword', 'attr-name', 'selector'],
        style: {
          color: keywordColor,
        },
      },
      {
        types: ['function', 'deleted', 'tag'],
        style: {
          color: keywordColor,
        },
      },
      {
        types: ['function-variable'],
        style: {
          color: valueColor,
        },
      },
    ],
  };
}
