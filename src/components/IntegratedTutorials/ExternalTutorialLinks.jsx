import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import InfoCard from '../Common/InfoCard/InfoCard';
import { getFullPath } from '../../lib/common-helpers';

const TUTORIALS = [
  {
    icon: <img src={getFullPath('/assets/python-logo.svg')} alt="Python logo" height={'24px'} />,
    title: '5 minute RAG with DeepSeek',
    description: 'Ground your chatbot in fact-based knowledge using Retrieval-Augmented Generation.',
    href: 'https://qdrant.tech/documentation/rag-deepseek/',
  },
  {
    icon: <img src={getFullPath('/assets/qdrant-logo.svg')} alt="Qdrant logo" height={'24px'} />,
    title: 'Hybrid Search with Qdrant',
    description: 'Build your own keyword + semantic search service using Qdrant and FastEmbed.',
    href: 'https://qdrant.tech/documentation/beginner-tutorials/hybrid-search-fastembed/',
  },
  {
    icon: <img src={getFullPath('/assets/fastapi-logo.svg')} alt="FastAPI logo" height={'24px'} />,
    title: 'Basic Semantic Search Engine',
    description: 'Build information retrieval based on semantic meaning in 5 minutes.',
    href: 'https://qdrant.tech/documentation/beginner-tutorials/search-beginners/',
  },
  {
    icon: <img src={getFullPath('/assets/camel-ai-logo.svg')} alt="Camel-AI logo" height={'24px'} />,
    title: 'Agentic RAG discord bot',
    description: 'Develop a fully functional chatbot using Qdrant, CAMEL-AI, and OpenAI.',
    href: 'https://qdrant.tech/documentation/agentic-rag-camelai-discord/',
  },
  {
    icon: <img src={getFullPath('/assets/golang-logo.svg')} alt="Golang logo" height={'24px'} />,
    title: 'E-commerce Search Engine',
    description: `Build and deploy high-performance semantic retrieval for thousands of products.`,
    href: 'https://qdrant.tech/documentation/tutorials-search-engineering/ecommerce-search-golang/',
  },
  {
    icon: <img src={getFullPath('/assets/qdrant-logo.svg')} alt="Qdrant logo" height={'24px'} />,
    title: 'See more tutorials on Qdrant.tech',
    description: 'See more tutorials',
    href: 'https://qdrant.tech/documentation/beginner-tutorials/',
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
