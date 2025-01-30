import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { getTutorialSubPages } from './TutorialSubpages';
import { useClient } from '../../context/client-context';

export const TutorialFooter = ({ pageSlug }) => {
  const { isRestricted } = useClient();
  const tutorialPages = getTutorialSubPages(isRestricted);

  let currentIndex = -1;
  if (pageSlug) {
    currentIndex = tutorialPages.findIndex(([slug]) => slug === pageSlug);
  }

  const prevPage = currentIndex > 0 ? tutorialPages[currentIndex - 1][0] : null;
  const nextPage = currentIndex < tutorialPages.length - 1 ? tutorialPages[currentIndex + 1][0] : null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
      {prevPage ? (
        <Button component={Link} to={`/tutorial/${prevPage}`} variant="outlined">
          Previous
        </Button>
      ) : (
        <div />
      )}
      {nextPage ? (
        <Button component={Link} to={`/tutorial/${nextPage}`} variant="outlined">
          Next
        </Button>
      ) : (
        <div />
      )}
    </Box>
  );
};

TutorialFooter.propTypes = {
  pageSlug: PropTypes.string,
};
