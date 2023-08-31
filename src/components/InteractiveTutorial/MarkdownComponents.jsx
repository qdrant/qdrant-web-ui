import React from 'react';
import { Typography } from '@mui/material';
import { CodeBlock } from './CodeBlock';

// if we will use mdx in other places, then this is better to be done on the App level
// and passed into MDXProvider wrapping the app

export const markdownComponents = {
  h1: (props) => <Typography component={'h1'} variant={'h4'} {...props} />,
  h2: (props) => <Typography component={'h2'} variant={'h5'} {...props} />,
  h3: (props) => <Typography component={'h3'} variant={'h6'} {...props} />,
  h4: (props) => <Typography component={'h4'} variant={'subtitle1'} {...props} />,
  p: (props) => <Typography component={'p'} variant={'body1'} {...props} />,
  pre: (props) => <CodeBlock {...props} />,
};
