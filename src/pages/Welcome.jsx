import React, { useState } from 'react';
import { Box, Typography, Link, Grid } from '@mui/material';
import AnnouncementBanner from '../components/Common/AnnouncementBanner';
import CardBanner from '../components/Common/CardBanner';
import InfoCard from '../components/Common/InfoCard';
import { Workflow, FileCode, Filter, Search, Layers, Zap, GitBranch, Users } from 'lucide-react';

const Welcome = () => {
  const [showBanner, setShowBanner] = useState(true);

  const handleCloseBanner = () => {
    setShowBanner(false);
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
      <AnnouncementBanner show={showBanner} onClose={handleCloseBanner}>
        {/* todo: use api for announcements */}
        <Typography>
          Blend vector similarity with custom logic using Score Boosting Reranker. Blend vector similarity with custom
          logic using Score Boosting Reranker. &nbsp;
          <Link target="_blank" href="https://qdrant.tech/docs/">
            Now available in Qdrant 1.14
          </Link>
        </Typography>
      </AnnouncementBanner>

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
          buttonHref="/tutorial/quickstart"
          imgSrc="/assets/console.svg"
        />
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          Connect to your Project or Start with Samples
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={Workflow}
              title="API Reference"
              description={
                'Explore Qdrant&apos;s REST API and SDKs to connect, query, and manage your vector data with ease.'
              }
              href="/api-reference"
              showCta={false}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={FileCode}
              title="Load Sample Data"
              description={`Follow this tutorial to import a remote snapshot and explore vector search with real data in just a few steps.`}
              href="/datasets"
              showCta={false}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          Interactive Tutorials
        </Typography>
        <Grid container spacing={2} sx={{ '& > .MuiGrid-root': { display: 'flex' } }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={Filter}
              iconVariant="top"
              title="Filtering - Beginner"
              description="Filter search results using basic payload conditions."
              href="/tutorial/filtering-beginner"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={Filter}
              iconVariant="top"
              title="Filtering - Advanced"
              description="Try advanced filtering based on nested payload conditions."
              href="/tutorial/filtering-advanced"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={Search}
              iconVariant="top"
              title="Filtering - Full Text"
              description="Search for substrings, tokens, or phrases within text fields."
              href="/tutorial/filteringfulltext"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={Layers}
              iconVariant="top"
              title="Multivector Search"
              description="Work with data represented by ColBERT multivectors."
              href="/tutorial/multivectors"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={Zap}
              iconVariant="top"
              title="Sparse Vector Search"
              description="Use sparse vectors to get specific search results."
              href="/tutorial/sparsevectors"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={GitBranch}
              iconVariant="top"
              title="Hybrid Search"
              description="Combine dense and sparse vectors for more accurate search results."
              href="/tutorial/hybridsearch"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <InfoCard
              icon={Users}
              iconVariant="top"
              title="Multitenancy"
              description="Manage multiple users within a single collection."
              href="/tutorial/multitenancy"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Welcome;
