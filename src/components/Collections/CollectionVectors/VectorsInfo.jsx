import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  FormControlLabel,
  Switch,
  CardContent,
} from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import Typography from '@mui/material/Typography';
import { PublishedWithChanges } from '@mui/icons-material';
import { checkIndexAccuracy } from './check-index-accuracy';
import { useClient } from '../../../context/client-context';
import CodeEditorWindow from '../../FilterEditorWindow';

const VectorTableRow = ({ vectorObj, name, onCheckIndexQuality, accuracy }) => {
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
          {accuracy ? `${accuracy * 100}%` : '—'}
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
  accuracy: PropTypes.number,
};

const VectorsInfo = ({ collectionName, vectors, onRequestResult, ...other }) => {
  const { client } = useClient();
  const isNamedVector = !(vectors?.size && vectors?.distance);
  const vectorsNames = isNamedVector ? Object.keys(vectors) : null;
  const [accuracy, setAccuracy] = useState(() => {
    if (vectorsNames) {
      return vectorsNames.reduce((acc, name) => {
        acc[name] = null;
        return acc;
      }, {});
    }
    return null;
  });

  const [advancedMod, setAdvancedMod] = useState(false);

  const [code, setCode] = useState('');
  const handleRunCode = async (code) => {
    console.log('handle run code', code);
  };

  const queryRequestSchema = (vectorNames) => ({
    description: 'Filter request',
    type: 'object',
    properties: {
      limit: {
        description: 'Page size. Default: 10',
        type: 'integer',
        format: 'uint',
        minimum: 1,
        nullable: true,
      },
      filter: {
        description: 'Look only for points which satisfies this conditions. If not provided - all points.',
        anyOf: [
          {
            $ref: '#/components/schemas/Filter',
          },
          {
            nullable: true,
          },
        ],
      },
      using: {
        description: 'Vector field name',
        type: 'string',
        enum: vectorNames,
      },
    },
  });
  // todo:
  // - how timeout should work for several requests?
  // - timeout, show warning/explanation
  // - show spinner

  useEffect(() => {
    // if accuracy is null or is object in which each key value is null
    if (!accuracy || (isNamedVector && Object.values(accuracy).every((val) => val === null))) {
      onRequestResult && onRequestResult(JSON.stringify('No accuracy data is requested'));
      return;
    }

    onRequestResult &&
      onRequestResult(JSON.stringify('Mean accuracy for collection: ' + JSON.stringify(accuracy).replace(/"/g, "'")));
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

      onRequestResult && onRequestResult(JSON.stringify(scrollResult)); // todo: bigIntJSON.stringify?

      // todo: if exceeded timeout

      const idxs = scrollResult.points.map((point) => point.id);

      for (const idx of idxs) {
        const acc = await checkIndexAccuracy(client, collectionName, idx, vectorName);
        onRequestResult && onRequestResult('Point ID ' + idx + ' accuracy: ' + acc);
        if (acc) {
          accs.push(acc);
        }
      }

      if (vectorName) {
        setAccuracy((prev) => {
          return {
            ...prev,
            // todo: wrong rounding
            [vectorName]: accs.reduce((acc, val) => acc + val, 0) / accs.length,
          };
        });
      } else {
        // todo: wrong rounding
        setAccuracy(accs.reduce((acc, val) => acc + val, 0) / accs.length);
      }
    } catch (e) {
      // todo
      console.error(e);
      onRequestResult && onRequestResult(JSON.stringify(e));
    }
  };

  return (
    <Card variant="dual" data-testid="vectors-info" {...other}>
      <CardHeader
        title={
          <>
            {!advancedMod ? 'Vectors Info' : 'Console'}
            <FormControlLabel
              sx={{ ml: 2 }}
              control={<Switch checked={advancedMod} onChange={() => setAdvancedMod(!advancedMod)} size="small" />}
              label={
                <Typography component={'span'} variant={'caption'}>
                  Advanced Mod
                </Typography>
              }
            />
          </>
        }
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={
          <>
            <CopyButton text={advancedMod ? code : bigIntJSON.stringify(vectors)} />
          </>
        }
      />
      {!advancedMod && (
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
              <VectorTableRow
                vectorObj={vectors}
                onCheckIndexQuality={() => onCheckIndexAccuracy(null)}
                accuracy={accuracy}
              />
            ) : (
              Object.keys(vectors).map((key) => (
                <VectorTableRow
                  vectorObj={vectors[key]}
                  name={key}
                  onCheckIndexQuality={() => onCheckIndexAccuracy(key)}
                  accuracy={accuracy ? accuracy[key] : null}
                  key={key}
                />
              ))
            )}
          </TableBody>
        </Table>
      )}

      {advancedMod && (
        <CardContent sx={{ pl: 0, height: '25vh' }}>
          <CodeEditorWindow
            code={code}
            onChange={setCode}
            onChangeResult={handleRunCode}
            customRequestSchema={queryRequestSchema}
          />
        </CardContent>
      )}
    </Card>
  );
};

VectorsInfo.propTypes = {
  collectionName: PropTypes.string,
  vectors: PropTypes.object.isRequired,
  onRequestResult: PropTypes.func,
  other: PropTypes.object,
};

export default VectorsInfo;
