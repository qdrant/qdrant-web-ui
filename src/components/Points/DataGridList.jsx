import React from 'react';
import PropTypes from 'prop-types';
import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

/**
 * A list of key-value pairs, where the value is either a string or an object.
 * if the value is an object, it will be rendered as a JSON tree.
 * @param {Object} data - key-value pairs to render
 * @param {Object} specialCases - key-value pairs to render, where the value is JSX element
 * @param {Function} onConditionChange - callback for changing conditions
 * @param {Array} conditions - current conditions
 * @return {unknown[]} - array of JSX elements
 */
export const DataGridList = function ({ data = {}, specialCases = {}, onConditionChange, conditions, payloadSchema }) {
  const theme = useTheme();
  const specialKeys = Object.keys(specialCases) || [];

  return Object.keys(data).map((key) => {
    return (
      <div key={key}>
        <Grid container spacing={2}>
          <Grid my={1} size={3}>
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

          <Grid my={1} size={9}>
            {/* special cases */}
            {specialKeys?.includes(key) && specialCases[key]}

            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                wordBreak: 'break-word',
                width: '100%',
                display: 'inline-flex',
                justifyContent: 'space-between',
              }}
            >
              {/* objects */}
              {typeof data[key] === 'object' && !specialKeys.includes(key) && (
                <JsonViewer
                  theme={theme.palette.mode}
                  value={data[key]}
                  displayDataTypes={false}
                  defaultInspectDepth={4}
                  rootName={false}
                  style={theme.palette.mode === 'dark' ? { backgroundColor: theme.palette.background.card } : {}}
                />
              )}

              {/* other types of values */}
              {typeof data[key] !== 'object' && !specialKeys.includes(key) && (
                <span>
                  {'\t'} {data[key].toString()}
                </span>
              )}
              {payloadSchema &&
                payloadSchema[key] &&
                (payloadSchema[key].data_type === 'keyword' ||
                  payloadSchema[key].data_type === 'text' ||
                  payloadSchema[key].data_type === 'integer' ||
                  payloadSchema[key].data_type === 'bool') &&
                typeof data[key] !== 'object' && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      const filter = {
                        key: key,
                        type: 'payload',
                        value: data[key],
                      };
                      if (conditions.find((c) => c.key === filter.key && c.value === filter.value)) {
                        return;
                      }
                      if (typeof onConditionChange === 'function') {
                        onConditionChange([...conditions, filter]);
                      }
                    }}
                  >
                    <FilterAltIcon />
                  </IconButton>
                )}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
      </div>
    );
  });
};

DataGridList.propTypes = {
  data: PropTypes.object.isRequired,
  specialCases: PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.element,
  }),
  onConditionChange: PropTypes.func,
  conditions: PropTypes.array,
  payloadSchema: PropTypes.object,
};
