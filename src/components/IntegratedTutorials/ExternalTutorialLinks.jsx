import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import InfoCard from '../Common/InfoCard/InfoCard';
import { getFullPath } from '../../lib/common-helpers';

const TUTORIALS = [
  {
    icon: <img src={getFullPath('/assets/python-logo.svg')} alt="Python logo" height={'24px'} />,
    title: '5 minute RAG with DeepSeek',
    description: 'Build a Retrieval-Augmented Generation (RAG) pipeline using Qdrant and DeepSeek.',
    href: 'https://qdrant.tech/documentation/rag-deepseek/',
  },
  {
    icon: <img src={getFullPath('/assets/fastapi-logo.svg')} alt="FastAPI logo" height={'24px'} />,
    title: 'Build a Semantic Search Engine',
    description: 'In 5 minutes you will build a semantic search engine for science fiction books.',
    href: 'https://qdrant.tech/documentation/beginner-tutorials/search-beginners/',
  },
  {
    icon: <img src={getFullPath('/assets/golang-logo.svg')} alt="Golang logo" height={'24px'} />,
    title: 'Build a high-performance e-commerce search engine',
    description:
      'Build and deploy your own neural search service to look through millions of products for an E-commerce site.',
    href: 'https://qdrant.tech/documentation/beginner-tutorials/ecommerce-search/',
  },
  {
    icon: <img src={getFullPath('/assets/camel-ai-logo.svg')} alt="Camel-AI logo" height={'24px'} />,
    title: 'Agentic RAG discord bot with Camel-AI',
    description: 'Develop a fully functional chatbot using Qdrant, CAMEL-AI, and OpenAI.',
    href: 'https://qdrant.tech/documentation/agentic-rag-camelai-discord/',
  },
  {
    icon: <img src={getFullPath('/assets/qdrant-logo.svg')} alt="Qdrant logo" height={'24px'} />,
    title: 'Build a Hybrid Search Service with FastEmbed and Qdrant',
    description: 'Build and deploy your own hybrid search service to look companies on startups-list.com.',
    href: 'https://qdrant.tech/documentation/beginner-tutorials/hybrid-search-fastembed/',
  },
];

const ExternalTutorialLinks = () => {
  return (
    <Box component="section">
      <Typography component="h2" variant="h6" mb="1rem">
        {'Integrated Tutorials'}
      </Typography>
      <Grid container spacing={2} sx={{ '& > .MuiGrid-root': { display: 'flex' } }}>
        {TUTORIALS.map((tutorial) => (
          <Grid key={tutorial.href} size={{ xs: 12, md: 6, lg: 4 }}>
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
};

export default ExternalTutorialLinks;
