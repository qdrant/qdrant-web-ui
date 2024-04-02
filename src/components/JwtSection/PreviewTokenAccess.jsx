import React, { useEffect, useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import { Checkbox, Chip, Grid, ListItemText, Typography } from '@mui/material';
import { Box } from '@mui/system';
import CallScrollRequest from './CallScrollRequest';
import PropTypes from 'prop-types';
import qdrantClient from '../../common/client';

const PreviewTokenAccess = (props) => {
  const { token, collections } = props;
  const [selectedCollections, setSelectedCollections] = useState([]);
  const tokenBasedClient = qdrantClient(token);

  useEffect(() => {
    console.log(collections);
  }, [token, collections]);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h4">Preview of token access</Typography>
        <Select
          multiple
          value={selectedCollections}
          onChange={(e) => setSelectedCollections(e.target.value)}
          fullWidth
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {collections.map((collection) => (
            <MenuItem key={collection} value={collection}>
              <Checkbox checked={selectedCollections.indexOf(collection) > -1} />
              <ListItemText primary={collection} />
            </MenuItem>
          ))}
        </Select>
      </Grid>
      {selectedCollections.map((collection) => (
        <CallScrollRequest client={tokenBasedClient} collection={collection} key={collection} />
      ))}
    </>
  );
};

PreviewTokenAccess.propTypes = {
  token: PropTypes.string,
  collections: PropTypes.array,
};

export default PreviewTokenAccess;
