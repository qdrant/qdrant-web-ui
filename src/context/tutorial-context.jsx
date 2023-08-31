import React, { useContext, createContext, useState } from 'react';

const TutorialContext = createContext({});

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = (props) => {
  const [result, setResult] = useState('{}');

  return <TutorialContext.Provider value={{ result, setResult }} {...props} />;
};
