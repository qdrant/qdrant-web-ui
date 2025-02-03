// add unavailable routes to show message on these pages
// useful if used bookmarked or shared link
export const restrictedRoutes = [
  '/datasets',
  '/jwt',
  '/tutorial',
];

export const isPathRestricted = (path) => {
  return restrictedRoutes.some((restrictedPath) => {
    if (restrictedPath.includes('*')) {
      const regexPath = restrictedPath.replace('*', '.*');
      return new RegExp(`^${regexPath}$`).test(path);
    }
    return path === restrictedPath;
  });
};

export const isTokenRestricted = (token) => {
  if (!token) {
    return false;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (!decodedToken.access || !Array.isArray(decodedToken.access)) {
      return false;
    }
    return decodedToken.access.some(({ access }) => access === 'prw');
  } catch (e) {
    return false;
  }
};
