import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Link, Alert } from '@mui/material';
import { MdxCodeBlock } from './MdxCodeBlock';
import { deepOrange } from '../../../theme/colors';

export const InlineCode = (props) => {
  return (
    <Typography
      component={'code'}
      variant={'code'}
      sx={{
        background: 'transparent',
        borderRadius: 1,
        p: 0.3,
        color: deepOrange['500'],
      }}
      {...props}
    />
  );
};

export const CustomLink = (props) => {
  if (props.href.includes('http')) {
    return <Link target="_blank" {...props} />;
  } else {
    return <Link {...props} />;
  }
};

CustomLink.propTypes = {
  href: PropTypes.string,
};

export const mdxComponents = {
  h1: (props) => <Typography component={'h1'} variant={'h4'} mb={3} {...props} />,
  h2: (props) => <Typography component={'h2'} variant={'h5'} mt={5} mb={2} {...props} />,
  h3: (props) => <Typography component={'h3'} variant={'h6'} mt={2} {...props} />,
  h4: (props) => <Typography component={'h4'} variant={'subtitle1'} mt={2} {...props} />,
  p: (props) => <Typography component={'p'} variant={'body1'} mb={2} {...props} />,
  a: (props) => <CustomLink {...props} />,
  img: (props) => <img width={'100%'} {...props} alt={props.alt || 'image'} />,
  pre: (props) => <MdxCodeBlock {...props} />,
  em: (props) => <Typography component={'em'} variant={'body1'} {...props} />,
  code: (props) => <InlineCode {...props} />,
  Alert: (props) => <Alert {...props} />,
};
