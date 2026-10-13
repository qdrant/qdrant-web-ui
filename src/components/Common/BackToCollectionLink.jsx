import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { ButtonBase, Tooltip, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Header link back to the collection page: the arrow and the collection name
// form a single clickable element with one shared hover/focus state.
const BackToCollectionLink = ({ collectionName }) => (
  <Tooltip title={'Back to collection'}>
    <ButtonBase
      component={Link}
      to={`/collections/${encodeURIComponent(collectionName)}`}
      aria-label={`Back to collection ${collectionName}`}
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        justifyContent: 'flex-start',
        gap: { xs: 1, sm: 3 },
        // Keep the arrow at the same spot as the former small IconButton
        p: '5px',
        pr: 1.5,
        borderRadius: 1,
        color: 'text.primary',
        transition: (theme) =>
          theme.transitions.create('background-color', { duration: theme.transitions.duration.shortest }),
        '&:hover': { backgroundColor: 'action.hover' },
        '&.Mui-focusVisible': { backgroundColor: 'action.focus' },
      }}
    >
      <ArrowBack sx={{ color: 'action.active', flexShrink: 0 }} />
      <Typography variant="h6" noWrap component="span">
        {collectionName}
      </Typography>
    </ButtonBase>
  </Tooltip>
);

BackToCollectionLink.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default BackToCollectionLink;
