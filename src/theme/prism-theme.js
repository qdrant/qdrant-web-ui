import { lightGreen, deepOrange, blue } from './colors';

// Creates a Prism theme object compatible with prism-react-renderer
// Accepts MUI `theme` so colors can adapt to light/dark mode
export default function createPrismTheme(theme) {
  return {
    plain: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.code,
    },
    styles: [
      {
        types: ['comment', 'prolog', 'doctype', 'cdata'],
        style: {
          color: lightGreen[300],
          fontStyle: 'italic',
        },
      },
      {
        types: ['string', 'attr-value'],
        style: {
          color: deepOrange[300],
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
          color: lightGreen[300],
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
          color: blue[500],
        },
      },
      {
        types: ['function', 'deleted', 'tag'],
        style: {
          color: blue[500],
        },
      },
      {
        types: ['function-variable'],
        style: {
          color: lightGreen[300],
        },
      },
    ],
  };
}
