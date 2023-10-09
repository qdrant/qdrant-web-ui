import React from 'react';
import InteractiveTutorial from '../components/InteractiveTutorial/InteractiveTutorial';
import { TutorialProvider } from '../context/tutorial-context';
import { useParams } from "react-router-dom";

export const Tutorial = () => {
  const { pageSlug } = useParams();
  return (
    <TutorialProvider>
      <InteractiveTutorial pageSlug={pageSlug} />
    </TutorialProvider>
  );
};

export default Tutorial;
