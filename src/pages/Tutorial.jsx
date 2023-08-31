import React from 'react';
import InteractiveTutorial from '../components/InteractiveTutorial/InteractiveTutorial';
import { TutorialProvider } from '../context/tutorial-context';

export const Tutorial = () => {
  return (
    <TutorialProvider>
      <InteractiveTutorial />
    </TutorialProvider>
  );
};

export default Tutorial;
