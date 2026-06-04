import React, { useState } from 'react';
import { Box, Typography, Link, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AnnouncementBanner from '../components/Common/AnnouncementBanner';
import CardBanner from '../components/Common/CardBanner';
import InfoCard from '../components/Common/InfoCard/InfoCard';
import TutorialLinks from '../components/InteractiveTutorial/TutorialLinks';
import { Workflow, FileCode } from 'lucide-react';
import { useExternalInfo } from '../context/external-info-context';
import { getFullPath } from '../lib/common-helpers';

const Welcome = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(true);
  const { banner } = useExternalInfo();

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  const displayBannerContent = () => {
    if (!banner || !showBanner) {
      return null;
    }

    return (
      <AnnouncementBanner show={showBanner} onClose={handleCloseBanner}>
        <Typography>
          {banner.message} &nbsp;
          {banner.link && (
            <Link target="_blank" href={banner.link}>
              {banner.link_text}
            </Link>
          )}
        </Typography>
      </AnnouncementBanner>
    );
  };

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        p: 5,
        margin: 'auto',
        maxWidth: '1120px',
      }}
    >
      {displayBannerContent()}

      <Box component="header">
        <Typography
          component="h1"
          variant="h4"
          sx={{
            color: 'text.primary',
            fontFeatureSettings: "'ss01' on, 'ss05' on, 'ss06' on, 'liga' off, 'clig' off",
            fontSize: '2rem',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: '125%',
            letterSpacing: '-0.5px',
            mb: '1rem',
          }}
        >
          {t('welcome.title')}
        </Typography>

        <CardBanner
          title={t('welcome.cardTitle')}
          description={t('welcome.cardDescription')}
          buttonText={t('welcome.cardButton')}
          linkTo="/tutorial/quickstart"
          imgSrc={getFullPath('/assets/console.svg')}
        />
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          {t('welcome.sectionTitle')}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={Workflow}
              title={t('welcome.apiReference')}
              description={t('welcome.apiDescription')}
              href="https://api.qdrant.tech/"
              showCta={false}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={FileCode}
              title={t('welcome.loadSampleData')}
              description={t('welcome.loadSampleDescription')}
              href="/datasets"
              showCta={false}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          {t('welcome.interactiveTutorials')}
        </Typography>
        <TutorialLinks sections={['vectorSearch', 'multitenancy']} showTitle={false} />
      </Box>
    </Box>
  );
};

export default Welcome;
