/**
 * Get the section name from the location hash
 * @return {string}
 * @example #/section/subsection => section
 */
export const getSectionFromLocationHash = () => {
  return window.location.hash.replace('#/', '').replace(/(\/[\w-]+)+/, '');
};
