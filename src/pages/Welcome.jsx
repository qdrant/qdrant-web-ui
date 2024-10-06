import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  max-width: 600px;
  margin-bottom: 2rem;
`;

const Welcome = () => {
  return (
    <Box component="main" px={4}>
      <Box component="header">
        <Typography component="h1" variant="h4" mt={4} mb={6}>
          Welcome to Qdrant!
        </Typography>
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
