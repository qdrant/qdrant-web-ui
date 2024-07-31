import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, IconButton } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import Typography from '@mui/material/Typography';
import { PublishedWithChanges } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { checkIndexAccuracy } from './check-index-accuracy';
import { useClient } from '../../../context/client-context';

const VectorTableRow = ({ vectorObj, name, onCheckIndexQuality }) => {
  return (
    <TableRow data-testid="vector-row">
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {name ?? '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {vectorObj.size}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {vectorObj.distance}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          1111
        </Typography>
        <Tooltip title={'Check index quality'} placement="left">
          <IconButton
            aria-label="Check index quality"
            data-testid="index-quality-check-button"
            onClick={onCheckIndexQuality}
          >
            <PublishedWithChanges color={'primary'} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

VectorTableRow.propTypes = {
  vectorObj: PropTypes.object,
  name: PropTypes.string,
  onCheckIndexQuality: PropTypes.func,
};

const VectorsInfo = ({ collectionName, vectors, ...other }) => {
  const { client } = useClient();
  const [accuracy, setAccuracy] = useState([]);

  // todo:
  // - timeout, show warning/explanation
  // - show spinner
  // - limit?

  useEffect(() => {
    console.log('accuracy', accuracy);
  }, [accuracy]);

  if (!vectors) {
    return <>No vectors</>;
  }

  const onCheckIndexAccuracy = async (vectorName) => {
    const accs = [];
    try {
      const scrollResult = await client.scroll(collectionName, {
        with_payload: false,
        with_vector: false,
        limit: 100,
        timeout: 20000,
      });
      const idxs = scrollResult.points.map((point) => point.id);

      for (const idx of idxs) {
        const acc = await checkIndexAccuracy(client, collectionName, idx, vectorName);
        if (acc) {
          accs.push(acc);
        }
      }

      setAccuracy(accs);
    } catch (e) {
      // todo
      console.error(e);
    }
  };

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
            <Link to={`/collections/${collectionName}/accuracy-check`}>Check index quality</Link>
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
            <TableCell>
              <Typography variant="subtitle1" fontWeight={600}>
                Accuracy
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {vectors.size && vectors.distance ? (
            <VectorTableRow vectorObj={vectors} onCheckIndexQuality={() => onCheckIndexAccuracy(null)} />
          ) : (
            Object.keys(vectors).map((key) => (
              <VectorTableRow
                vectorObj={vectors[key]}
                name={key}
                onCheckIndexQuality={() => onCheckIndexAccuracy(key)}
                key={key}
              />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

VectorsInfo.propTypes = {
  collectionName: PropTypes.string,
  vectors: PropTypes.object,
  other: PropTypes.object,
};

export default VectorsInfo;
