import React from 'react';
import PropTypes from 'prop-types';
import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Typography } from '@mui/material';

/**
 * A list of key-value pairs, where the value is either a string or an object.
 * if the value is an object, it will be rendered as a JSON tree.
 * @param {Object} data - key-value pairs to render
 * @param {Object} specialCases - key-value pairs to render, where the value is JSX element
 * @param {Function} onConditionChange - callback for changing conditions
 * @param {Array} conditions - current conditions
 * @return {unknown[]} - array of JSX elements
 */
export const DataGridList = function ({ data = {}, specialCases = {}, onConditionChange, conditions }) {
  const theme = useTheme();
  const specialKeys = Object.keys(specialCases) || [];

  return Object.keys(data).map((key) => {
    return (
      <div key={key}>
        <Grid container spacing={2}>
          <Grid item xs={3} my={1}>
            <Typography
              variant="subtitle1"
              sx={{
                display: 'inline',
                wordBreak: 'break-word',
                fontWeight: 600,
              }}
            >
              {key}
            </Typography>
          </Grid>

          <Grid item xs={9} my={1}>
            {/* special cases */}
            {specialKeys?.includes(key) && specialCases[key]}

            {/* objects */}
            {typeof data[key] === 'object' && !specialKeys.includes(key) && (
              <Typography variant="subtitle1">
                {' '}
                <JsonViewer
                  theme={theme.palette.mode}
                  value={data[key]}
                  displayDataTypes={false}
                  defaultInspectDepth={0}
                  rootName={false}
                />{' '}
              </Typography>
            )}

            {/* other types of values */}
            {typeof data[key] !== 'object' && !specialKeys.includes(key) && (
              <Typography
                variant="subtitle1"
                color="text.secondary"
                display={'inline'}
                sx={{ wordBreak: 'break-word' }}
                onClick={() => {
                  const filter = {
                    key: key,
                    type: 'payload',
                    value: data[key],
                    label: `${key}: ${data[key]}`,
                  };
                  onConditionChange([...conditions, filter]);
                }}
              >
                {'\t'} {data[key].toString()}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Divider />
      </div>
    );
  });
};

DataGridList.defaultProps = {
  data: {},
  specialCases: {},
};

DataGridList.propTypes = {
  data: PropTypes.object.isRequired,
  specialCases: PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.element,
  }),
  onConditionChange: PropTypes.func,
  conditions: PropTypes.array,
};
