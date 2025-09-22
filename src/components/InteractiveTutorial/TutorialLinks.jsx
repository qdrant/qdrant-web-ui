import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Typography } from '@mui/material';
import InfoCard from '../Common/InfoCard/InfoCard';
import { Filter, SlidersHorizontal, ScanText, VectorSquare, Grip, SearchCode, Network } from 'lucide-react';

const TUTORIAL_SECTIONS = {
  vectorSearch: {
    title: 'Vector Search',
    tutorials: [
      {
        icon: Filter,
        title: 'Filtering - Beginner',
        description: 'Filter search results using basic payload conditions.',
        href: '/tutorial/filteringbeginner',
      },
      {
        icon: SlidersHorizontal,
        title: 'Filtering - Advanced',
        description: 'Try advanced filtering based on nested payload conditions.',
        href: '/tutorial/filteringadvanced',
      },
      {
        icon: ScanText,
        title: 'Filtering - Full Text',
        description: 'Search for substrings, tokens, or phrases within text fields.',
        href: '/tutorial/filteringfulltext',
      },
      {
        icon: VectorSquare,
        title: 'Multivector Search',
        description: 'Work with data represented by ColBERT multivectors.',
        href: '/tutorial/multivectors',
      },
      {
        icon: Grip,
        title: 'Sparse Vector Search',
        description: 'Use sparse vectors to get specific search results.',
        href: '/tutorial/sparsevectors',
      },
      {
        icon: SearchCode,
        title: 'Hybrid Search',
        description: 'Combine dense and sparse vectors for more accurate search results.',
        href: '/tutorial/hybridsearch',
      },
    ],
  },
  multitenancy: {
    title: 'Setup Guide',
    tutorials: [
      {
        icon: Network,
        title: 'Multitenancy',
        description: 'Manage multiple users within a single collection.',
        href: '/tutorial/multitenancy',
      },
    ],
  },
};

const TutorialLinks = ({ sections = ['filtering', 'vectorSearch', 'multitenancy'], showTitle = true }) => {
  const allTutorials = sections.reduce((acc, sectionKey) => {
    const section = TUTORIAL_SECTIONS[sectionKey];
    if (section) {
      return [...acc, ...section.tutorials];
    }
    return acc;
  }, []);

  if (showTitle) {
    return (
      <>
        {sections.map((sectionKey) => {
          const section = TUTORIAL_SECTIONS[sectionKey];
          if (!section) return null;

          return (
            <Box key={sectionKey} component="section">
              <Typography component="h2" variant="h6" mb="1rem">
                {section.title}
              </Typography>
              <Grid container spacing={2} sx={{ '& > .MuiGrid-root': { display: 'flex' } }}>
                {section.tutorials.map((tutorial) => (
                  <Grid key={tutorial.href} size={{ xs: 12, md: 6, lg: 3 }}>
                    <InfoCard
                      icon={tutorial.icon}
                      iconVariant="top"
                      title={tutorial.title}
                      description={tutorial.description}
                      href={tutorial.href}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </>
    );
  }

  return (
    <Grid container spacing={2} sx={{ '& > .MuiGrid-root': { display: 'flex' } }}>
      {allTutorials.map((tutorial) => (
        <Grid key={tutorial.href} size={{ xs: 12, md: 6, lg: 3 }}>
          <InfoCard
            icon={tutorial.icon}
            iconVariant="top"
            title={tutorial.title}
            description={tutorial.description}
            href={tutorial.href}
          />
        </Grid>
      ))}
    </Grid>
  );
};

TutorialLinks.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.string),
  showTitle: PropTypes.bool,
};

export default TutorialLinks;
