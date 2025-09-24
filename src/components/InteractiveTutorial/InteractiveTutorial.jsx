import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { mdxComponents } from './MdxComponents/MdxComponents';
import { tutorialSubPages } from './TutorialSubpages';
import { TutorialFooter } from './TutorialFooter';
import { useLocation } from 'react-router-dom';
import { Prism } from 'prism-react-renderer';
const InteractiveTutorial = ({ pageSlug }) => {
  const location = useLocation();
  const tutorialPanelRef = React.useRef(null);

  useEffect(() => {
    // we need this to use prismjs support for json highlighting
    // which is not included in the prism-react-renderer package by default
    window.Prism = Prism; // (or check for window is undefined for ssr and use global)
    (async () => await import('prismjs/components/prism-json'))();
  }, []);

  useEffect(() => {
    if (tutorialPanelRef.current) {
      tutorialPanelRef.current.scrollTop = 0;
    }
  }, [location]);

  let TagName;
  try {
    TagName = tutorialSubPages.find((p) => p[0] === pageSlug)[1].default;
  } catch (e) {
    console.error(e);
  }

  // todo: maxWith
  return (
    <Box sx={{ maxWidth: '840px', margin: 'auto' }}>
      <TagName components={mdxComponents} />
      <TutorialFooter pageSlug={pageSlug} />
    </Box>
  );
};

InteractiveTutorial.propTypes = {
  pageSlug: PropTypes.string,
};

export default InteractiveTutorial;
