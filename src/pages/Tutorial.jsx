import React from 'react';
import InteractiveTutorial from '../components/InteractiveTutorial/InteractiveTutorial';
import { TutorialProvider } from '../context/tutorial-context';
import { useParams } from 'react-router-dom';
import { useClient } from '../context/client-context';
import { getTutorialIndexPage, getTutorialSubPages } from '../components/InteractiveTutorial/TutorialSubpages';

export const Tutorial = () => {
  const { pageSlug } = useParams();
  const { isRestricted } = useClient();

  const tutorialPages = getTutorialSubPages(isRestricted);
  const indexPage = getTutorialIndexPage(isRestricted);

  return (
    <TutorialProvider>
      <InteractiveTutorial
        pageSlug={pageSlug}
        tutorialPages={tutorialPages}
        indexPage={indexPage}
      />
    </TutorialProvider>
  );
};

export default Tutorial;
