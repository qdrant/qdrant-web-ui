import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import Typography from '@mui/material/Typography';
import { PublishedWithChanges } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const VectorsInfo = ({ vectors, ...other }) => {
  if (!vectors) {
    return <>No vectors</>;
  }

  return (
    <Card variant="dual" data-testid="vectors-info" {...other}>
      <CardHeader
        title={'Vectors Info'}
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={
          <>
            <CopyButton text={bigIntJSON.stringify(vectors)} />
            <Tooltip title={'Check index quality'} placement="left">
              <IconButton aria-label="Check index quality" data-testid="index-quality-check-button" onClick={() => {}}>
                <PublishedWithChanges color={'primary'} />
              </IconButton>
            </Tooltip>
          </>
        }
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle1" fontWeight={600}>
                Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" fontWeight={600}>
                Size
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" fontWeight={600}>
                Distance
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow data-testid="vector-row">
            <TableCell>
              <Typography variant="subtitle1" component={'span'} color="text.secondary">
                {vectors.size}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" component={'span'} color="text.secondary">
                {vectors.size}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle1" component={'span'} color="text.secondary">
                {vectors.distance}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
};

VectorsInfo.propTypes = {
  vectors: PropTypes.object,
  other: PropTypes.object,
};

export default VectorsInfo;
