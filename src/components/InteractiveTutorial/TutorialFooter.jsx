import React from 'react';
import { Box, Button, Divider, Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import pages from './TutorialSubpages';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

export const TutorialFooter = () => {
  const { pageSlug } = useParams();
  const pageKeys = [...Object.keys(pages)];
  pageKeys.splice(pageKeys.indexOf('index'), 1);
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
  };

  const handleNext = () => {
    if (currentPageIndex < pageKeys.length - 1) {
      currentPageIndex = currentPageIndex + 1;
      navigate(`/tutorial/${pageKeys[currentPageIndex]}`);
    }
  };

  return (
    <Box mt={10}>
      <Divider />
      <Grid container mt={4}>
        <Grid item xs={4} sx={{ textAlign: 'left' }}>
          {currentPageIndex >= 0 && (
            <Button sx={{ alignItems: 'flex-start' }} onClick={handlePrev} startIcon={<ArrowBack />}>
              Previous
            </Button>
          )}
        </Grid>

        <Grid item xs={4} sx={{ textAlign: 'center' }}>
          {currentPageIndex >= 0 && <Button onClick={() => navigate('/tutorial')}>Home</Button>}
        </Grid>

        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          {currentPageIndex < pageKeys.length - 1 && (
            <Button sx={{ alignItems: 'flex-start' }} onClick={handleNext} endIcon={<ArrowForward />}>
              Next
            </Button>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
