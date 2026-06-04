import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getTutorialSubPages } from './TutorialSubpages';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const TutorialFooter = () => {
  const { pageSlug } = useParams();
  const { t, i18n } = useTranslation();
  const tutorialSubPages = getTutorialSubPages(i18n.language);
  const pageKeys = [...tutorialSubPages.map((p) => p[0])];
  let currentPageIndex = pageKeys.indexOf(pageSlug);
  const navigate = useNavigate();

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      currentPageIndex = currentPageIndex - 1;
      navigate(`/tutorial/${pageKeys[currentPageIndex]}`);
    } else {
      currentPageIndex = 0;
      navigate('/tutorial');
    }
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (currentPageIndex < pageKeys.length - 1) {
      currentPageIndex = currentPageIndex + 1;
      navigate(`/tutorial/${pageKeys[currentPageIndex]}`);
    }
    window.scrollTo(0, 0);
  };

  return (
    <Box my={5}>
      <Grid container mt={4} spacing={1} justifyContent={'space-between'}>
        <Grid>
          {currentPageIndex >= 0 && (
            <Button sx={{ alignItems: 'flex-start' }} onClick={handlePrev} startIcon={<ArrowBack />}>
              {t('tutorial.previous')}
            </Button>
          )}
        </Grid>

        <Grid>
          {currentPageIndex < pageKeys.length - 1 && (
            <Button sx={{ alignItems: 'flex-start' }} onClick={handleNext} endIcon={<ArrowForward />}>
              {t('tutorial.next')}
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
