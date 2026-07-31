// Shared max-width values for page content containers.
// Keeping these in one place keeps page widths consistent and avoids
// scattered magic values like '900px' / '1120px' / 'xl' across pages.
//
// Values are passed to MUI's `maxWidth` (system prop or Container prop), so
// they may be a CSS length ('900px') or a theme breakpoint key ('xl').
export const PAGE_CONTENT_WIDTH = {
  // Narrow, form-focused pages (e.g. Settings, Access Tokens).
  narrow: '900px',
  // Reading/content pages (e.g. Welcome, Tutorial).
  content: '1120px',
  // Wide dashboard/list pages (e.g. Collections, Datasets, Collection).
  wide: 'xl',
};
