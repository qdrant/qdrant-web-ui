import React, { useState } from 'react';
import { Box, Button, Typography, Link, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import AnnouncementBanner from '../components/Common/AnnouncementBanner';
import CardBanner from '../components/Common/CardBanner';
import InfoCard from '../components/Common/InfoCard';
import { Workflow, FileCode } from 'lucide-react';

const ButtonsContainer = styled(Box)`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin: 2rem 0;
`;

const StyledButton = styled((props) => <Button variant="contained" {...props} />)`
  background-color: #333;
  color: white;
  font-size: 1rem;
  text-transform: capitalize;
  &:hover {
    background-color: #555;
  }
`;

const StyledAbstract = styled(Typography)`
  margin-bottom: 2rem;
`;

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
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={FileCode}
              title="Load Sample Data"
              description={`Follow this tutorial to import a remote snapshot and explore vector search with real data in just a few steps.`}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h5" mb="1rem">
          Begin by setting up your collection
        </Typography>
        <StyledAbstract>
          Start building your app by creating a collection and inserting your vectors. Interactive tutorials will show
          you how to organize data and perform searches.
        </StyledAbstract>
        <ButtonsContainer>
          <StyledButton variant="contained" component={Link} to="/tutorial/quickstart">
            Quickstart
          </StyledButton>
          <StyledButton variant="contained" component={Link} to="/tutorial/loadcontent">
            Load Sample Data
          </StyledButton>
          <StyledButton variant="contained" component={Link} to="/tutorial/">
            Vector Search Tutorials
          </StyledButton>
        </ButtonsContainer>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h5" mb="1rem">
          Connect to your new project
        </Typography>
        <StyledAbstract>
          Easily interact with your database using Qdrant SDKs and our REST API. Use these libraries to connect, query,
          and manage your vector data from the app.
        </StyledAbstract>
        <ButtonsContainer>
          <StyledButton
            className="btn"
            component={'a'}
            href="https://api.qdrant.tech/api-reference"
            target="_blank"
            rel="noopener noreferrer"
          >
            API Reference
          </StyledButton>
        </ButtonsContainer>
      </Box>
    </Box>
  );
};

export default Welcome;
