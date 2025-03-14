import React from 'react';

export const ColorModeContext = React.createContext({
  mode: 'auto',
  toggleColorMode: () => {},
});
