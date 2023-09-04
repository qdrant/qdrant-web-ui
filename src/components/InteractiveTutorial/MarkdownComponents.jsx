import React from 'react';
import { Typography } from '@mui/material';
import { CodeBlock } from './CodeBlock';

// if we will use mdx in other places, then this is better to be done on the App level
// and passed into MDXProvider wrapping the app

export const markdownComponents = {
  h1: (props) => <Typography component={'h1'} variant={'h4'} mb={3} {...props} />,
  h2: (props) => <Typography component={'h2'} variant={'h5'} mt={4} mb={2} {...props} />,
  h3: (props) => <Typography component={'h3'} variant={'h6'} mt={2} {...props} />,
  h4: (props) => <Typography component={'h4'} variant={'subtitle1'} mt={2} {...props} />,
  p: (props) => <Typography component={'p'} variant={'body1'} {...props} />,
  img: (props) => <img width={'100%'} {...props} alt={props.alt || 'image'} />,
  pre: (props) => <CodeBlock {...props} />,
};
