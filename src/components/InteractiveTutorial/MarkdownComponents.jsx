import React from 'react';
import { Typography, Link, Alert } from '@mui/material';
import { CodeBlock } from './CodeBlock';
import { useTheme } from '@mui/material/styles';

// if we will use mdx in other places, then this is better to be done on the App level
// and passed into MDXProvider wrapping the app
export const LIGHT_BACKGROUND = '#fbfbfb';
export const DARK_BACKGROUND = '#1e1e1e';
export const INLINE_CODE_COLOR_LIGHT = 'rgb(170, 9, 130)';
export const INLINE_CODE_COLOR_DARK = 'rgb(206, 145, 120)';

export const InlineCode = (props) => {
  const theme = useTheme();
  const background = theme.palette.mode === 'light' ? LIGHT_BACKGROUND : DARK_BACKGROUND;
  return (
    <Typography
      component={'code'}
      variant={'code'}
      sx={{
        background,
        borderRadius: 1,
        p: 0.3,
        color: theme.palette.mode === 'light' ? INLINE_CODE_COLOR_LIGHT : INLINE_CODE_COLOR_DARK,
      }}
      {...props}
    />
  );
};

export const markdownComponents = {
  h1: (props) => <Typography component={'h1'} variant={'h4'} mb={3} {...props} />,
  h2: (props) => <Typography component={'h2'} variant={'h5'} mt={4} mb={2} {...props} />,
  h3: (props) => <Typography component={'h3'} variant={'h6'} mt={2} {...props} />,
  h4: (props) => <Typography component={'h4'} variant={'subtitle1'} mt={2} {...props} />,
  p: (props) => <Typography component={'p'} variant={'body1'} mb={2} {...props} />,
  a: (props) => <Link target="_blank" {...props} />,
  img: (props) => <img width={'100%'} {...props} alt={props.alt || 'image'} />,
  pre: (props) => <CodeBlock {...props} />,
  em: (props) => <Typography component={'em'} variant={'body1'} {...props} />,
  code: (props) => <InlineCode {...props} />,
  Alert: (props) => <Alert {...props} />,
};
