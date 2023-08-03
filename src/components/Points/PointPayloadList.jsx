import React from 'react';
import PropTypes from 'prop-types';
import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Typography } from '@mui/material';

export const PointPayloadList = function ({ data }) {
  const theme = useTheme();

  return Object.keys(data.payload).map((key) => {
    return (
      <div key={key}>
        <Grid container spacing={2}>
          <Grid item xs={3} my={1}>
            <Typography variant="subtitle1" display={'inline'} fontWeight={600} sx={{ wordBreak: 'break-word' }}>
              {key}
            </Typography>
          </Grid>

          <Grid item xs={9} my={1}>
            {typeof data.payload[key] === 'object' ? (
              <Typography variant="subtitle1">
                {' '}
                <JsonViewer
                  theme={theme.palette.mode}
                  value={data.payload[key]}
                  displayDataTypes={false}
                  defaultInspectDepth={0}
                  rootName={false}
                />{' '}
              </Typography>
            ) : (
              <Typography variant="subtitle1" color="text.secondary" display={'inline'}>
                {'\t'} {data.payload[key].toString()}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Divider />
      </div>
    );
  });
};

PointPayloadList.propTypes = {
  data: PropTypes.object.isRequired,
};
