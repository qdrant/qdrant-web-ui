import React from 'react';
import InteractiveTutorial from '../components/InteractiveTutorial/InteractiveTutorial';
import { TutorialProvider } from '../context/tutorial-context';
import { useParams } from 'react-router-dom';

export const Tutorial = () => {
  const { pageName } = useParams();
  return (
    <TutorialProvider>
      <InteractiveTutorial pageName={pageName} />
    </TutorialProvider>
  );
};

export default Tutorial;
