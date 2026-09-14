import React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { Box, FormControl, MenuItem, Select, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

// Picks what the request panels are about: the whole instance, or one
// collection. Qdrant only breaks the request metrics down per collection when
// `/metrics` is asked for it, so the choice drives the poll as well as the
// filtering — see MetricsDashboard.
//
// Styled to sit quietly next to the tabs: a rounded segmented toggle using the
// primary accent for the active side (matching the app's buttons), plus a
// compact collection picker that appears only in per-collection mode.
function MetricsScope({ scope, onScopeChange, collection, collections, onCollectionChange }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
      <ToggleButtonGroup
        size="small"
        value={scope}
        exclusive
        onChange={(event, value) => value && onScopeChange(value)}
        aria-label="Metrics scope"
        sx={{
          '& .MuiToggleButton-root': {
            textTransform: 'capitalize',
            fontWeight: 500,
            fontSize: '0.8125rem',
            lineHeight: 1.4,
            px: 1.5,
            // Match the poll-interval / collection field height (~33.7px) so the
            // controls line up on one row.
            py: '6.75px',
            color: 'text.secondary',
            borderColor: 'divider',
            '&.Mui-selected': {
              color: 'primary.main',
              backgroundColor: (t) => alpha(t.palette.primary.main, 0.1),
              borderColor: (t) => alpha(t.palette.primary.main, 0.5),
              '&:hover': { backgroundColor: (t) => alpha(t.palette.primary.main, 0.16) },
            },
          },
        }}
      >
        <ToggleButton value="global">Global</ToggleButton>
        <ToggleButton value="collection">Per collection</ToggleButton>
      </ToggleButtonGroup>

      {scope === 'collection' && (
        <FormControl
          size="small"
          error={!collection}
          sx={{
            minWidth: 180,
            // Match the toggle's height/type and radius (4px) so the controls
            // line up; overrides the app's larger default select radius.
            '& .MuiOutlinedInput-root': { borderRadius: 1 },
            '& .MuiSelect-select': { py: '7.5px', minHeight: 'auto', fontSize: '0.8125rem', lineHeight: 1.4 },
          }}
        >
          <Select
            value={collections.includes(collection) ? collection : ''}
            onChange={(event) => onCollectionChange(event.target.value)}
            displayEmpty
            aria-label="Collection"
            renderValue={(value) =>
              value || (
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  Choose collection
                </Box>
              )
            }
          >
            {collections.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}

MetricsScope.propTypes = {
  scope: PropTypes.oneOf(['global', 'collection']).isRequired,
  onScopeChange: PropTypes.func.isRequired,
  collection: PropTypes.string.isRequired,
  collections: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCollectionChange: PropTypes.func.isRequired,
};

export default MetricsScope;
