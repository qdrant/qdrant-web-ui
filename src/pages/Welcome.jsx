import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import AnnouncementBanner from '../components/Common/AnnouncementBanner';
import CardBanner from '../components/Common/CardBanner';
import InfoCard from '../components/Common/InfoCard/InfoCard';
import TutorialLinks from '../components/InteractiveTutorial/TutorialLinks';
import { Workflow, FileCode, BrainCircuit } from 'lucide-react';
import { useExternalInfo } from '../context/external-info-context';
import { getFullPath } from '../lib/common-helpers';
import { PAGE_CONTENT_WIDTH, PAGE_PADDING_X } from '../theme/constants';

// Three side-icon cards only read well once each has ~300px; below that they
// stack into a single full-width column.
const RESOURCES_WIDE_QUERY = '@container gettingStarted (min-width: 960px)';

const Welcome = () => {
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
        px: PAGE_PADDING_X,
        margin: 'auto',
        maxWidth: PAGE_CONTENT_WIDTH.content,
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
          Welcome to Qdrant!
        </Typography>

        <CardBanner
          title="Get started with vector search in Qdrant"
          description="Start building your app by creating a collection and inserting your vectors."
          buttonText="View Quickstart"
          linkTo="/tutorial/quickstart"
          imgSrc={getFullPath('/assets/console.svg')}
        />
      </Box>

      <Box component="section" sx={{ containerType: 'inline-size', containerName: 'gettingStarted' }}>
        <Typography component="h2" variant="h6" mb="1rem">
          Getting Started Resources
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 2,
            [RESOURCES_WIDE_QUERY]: { gridTemplateColumns: 'repeat(3, 1fr)' },
          }}
        >
          <InfoCard
            icon={BrainCircuit}
            title="Agent Skills"
            description={
              'Download our AI Agent Skills, crafted by our team of experts to strengthen your Qdrant development.'
            }
            href="https://qdrant.tech/documentation/skills/"
            showCta={false}
          />
          <InfoCard
            icon={Workflow}
            title="API Reference"
            description={"Explore Qdrant's REST API and SDKs to connect, query, and manage your vector data with ease."}
            href="https://api.qdrant.tech/"
            showCta={false}
          />
          <InfoCard
            icon={FileCode}
            title="Sample Data"
            description={
              'Easily import a remote data snapshot and explore vector search with real data in just a few steps.'
            }
            href="/datasets"
            showCta={false}
          />
        </Box>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          Interactive Tutorials
        </Typography>
        <TutorialLinks sections={['vectorSearch', 'multitenancy']} showTitle={false} />
      </Box>
    </Box>
  );
};

export default Welcome;
