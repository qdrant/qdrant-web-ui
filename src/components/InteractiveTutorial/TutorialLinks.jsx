import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Typography } from '@mui/material';
import InfoCard from '../Common/InfoCard/InfoCard';
import { Filter, SlidersHorizontal, ScanText, VectorSquare, Grip, SearchCode, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const useTutorialSections = () => {
  const { t } = useTranslation();
  return {
    vectorSearch: {
      title: t('tutorial.vectorSearch'),
      tutorials: [
        {
          icon: Filter,
          title: t('tutorial.filteringBeginner'),
          description: t('tutorial.filteringBeginnerDesc'),
          href: '/tutorial/filteringbeginner',
        },
        {
          icon: SlidersHorizontal,
          title: t('tutorial.filteringAdvanced'),
          description: t('tutorial.filteringAdvancedDesc'),
          href: '/tutorial/filteringadvanced',
        },
        {
          icon: ScanText,
          title: t('tutorial.filteringFullText'),
          description: t('tutorial.filteringFullTextDesc'),
          href: '/tutorial/filteringfulltext',
        },
        {
          icon: VectorSquare,
          title: t('tutorial.multivectorSearch'),
          description: t('tutorial.multivectorSearchDesc'),
          href: '/tutorial/multivectors',
        },
        {
          icon: Grip,
          title: t('tutorial.sparseVectorSearch'),
          description: t('tutorial.sparseVectorSearchDesc'),
          href: '/tutorial/sparsevectors',
        },
        {
          icon: SearchCode,
          title: t('tutorial.hybridSearch'),
          description: t('tutorial.hybridSearchDesc'),
          href: '/tutorial/hybridsearch',
        },
      ],
    },
    multitenancy: {
      title: t('tutorial.setupGuide'),
      tutorials: [
        {
          icon: Network,
          title: t('tutorial.multitenancy'),
          description: t('tutorial.multitenancyDesc'),
          href: '/tutorial/multitenancy',
        },
      ],
    },
  };
};

const TutorialLinks = ({ sections = ['filtering', 'vectorSearch', 'multitenancy'], showTitle = true }) => {
  const TUTORIAL_SECTIONS = useTutorialSections();
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
