import React, { useState } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import Typography from '@mui/material/Typography';
import { PublishedWithChanges } from '@mui/icons-material';
import { checkIndexPrecision } from './check-index-precision';
import { useClient } from '../../../context/client-context';
import CodeEditorWindow from '../../FilterEditorWindow';

const VectorTableRow = ({ vectorObj, name, onCheckIndexQuality, precision, isInProgress }) => {
  return (
    <TableRow data-testid="vector-row">
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {name == '' ? '—' : name}
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
        {isInProgress && <LinearProgress />}
        {!isInProgress && (
          <>
            <Typography variant="subtitle1" component={'span'} color="text.secondary">
              {precision ? `${precision * 100}%` : '—'}
            </Typography>
            <Tooltip title="Check index quality">
              <IconButton
                aria-label="Check index quality"
                data-testid="index-quality-check-button"
                onClick={onCheckIndexQuality}
                sx={{ p: 0, ml: 1 }}
              >
                <PublishedWithChanges color={'primary'} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

VectorTableRow.propTypes = {
  vectorObj: PropTypes.object,
  name: PropTypes.string,
  onCheckIndexQuality: PropTypes.func,
  precision: PropTypes.number,
  isInProgress: PropTypes.bool,
};

const SearchQualityPanel = ({ collectionName, vectors, loggingFoo, clearLogsFoo, ...other }) => {
  const { client } = useClient();
  const vectorsNames = Object.keys(vectors);
  const [precision, setPrecision] = useState(() => {
    if (vectorsNames) {
      return vectorsNames.reduce((precision, name) => {
        precision[name] = null;
        return precision;
      }, {});
    }
    return null;
  });

  const [advancedMod, setAdvancedMod] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const [code, setCode] = useState(`
// Run this code to estimate search quality versus exact search
{
  "limit": 10,

  "params": {
    "hnsw_ef": 128
  }
}

// You can specify filters and different vector fields
// {
//   "limit": 100,
//   "using": "vector_name",
//   "filter": {
//     "must": {
//       "key": "field_name",
//       "match": {
//         "value": "field_value"
//       }
//     }
//   },
//  "timeout": 20
// }

  `);

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
      params: {
        description: 'Additional search params',
        anyOf: [
          {
            $ref: '#/components/schemas/SearchParams',
          },
          {
            nullable: true,
          },
        ],
      },
      timeout: {
        description: 'Timeout for search',
        type: 'integer',
        format: 'uint',
        minimum: 1,
        nullable: true,
      },
    },
  });

  if (!vectors) {
    return <>No vectors</>;
  }

  const onCheckIndexQuality = async ({ using = '', limit = 10, params = null, filter = null, timeout }) => {
    setInProgress(true);

    clearLogsFoo && clearLogsFoo();
    const precisions = [];
    try {
      const scrollResult = await client.scroll(collectionName, {
        with_payload: false,
        with_vector: false,
        limit: 100,
      });

      // todo: if exceeded timeout

      const pointIds = scrollResult.points.map((point) => point.id);
      const total = pointIds.length;

      loggingFoo && loggingFoo('Starting measuring quality on ' + total + ' requests for ' + using || '---');

      for (let idx = 0; idx < total; idx++) {
        const pointId = pointIds[idx];
        const precision = await checkIndexPrecision(
          client,
          collectionName,
          pointId,
          loggingFoo,
          idx,
          total,
          filter,
          params,
          using,
          limit,
          timeout
        );
        if (precision) {
          precisions.push(precision);
        }
      }

      // Round to 2 decimal places
      const round = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

      const avgPrecision = round(precisions.reduce((x, val) => x + val, 0) / precisions.length);
      const stdDev = round(
        Math.sqrt(precisions.reduce((x, val) => x + (val - avgPrecision) ** 2, 0) / precisions.length)
      );

      loggingFoo('Mean precision@' + limit + ' for collection: ' + avgPrecision + ' ± ' + stdDev);

      setPrecision((prev) => {
        return {
          ...prev,
          [using]: avgPrecision,
        };
      });

      setInProgress(false);
    } catch (e) {
      setInProgress(false);
      console.error(e);
      loggingFoo && loggingFoo(JSON.stringify(e));
    }
  };

  const handleRunCode = async (qulityCheckParams) => {
    onCheckIndexQuality(qulityCheckParams);
  };

  return (
    <Card variant="dual" data-testid="vectors-info" {...other}>
      <CardHeader
        title={
          <>
            Search Quality
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
              <TableCell sx={{ width: '25%' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Vector Name
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '25%' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Size
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '25%' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Distance
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '25%' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Precision
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.keys(vectors).map((vectorName) => (
              <VectorTableRow
                vectorObj={vectors[vectorName]}
                name={vectorName}
                onCheckIndexQuality={() => onCheckIndexQuality({ using: vectorName })}
                precision={precision ? precision[vectorName] : null}
                key={vectorName}
                isInProgress={inProgress}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {advancedMod && (
        <CardContent sx={{ p: 0, pt: 1, height: '32vh' }}>
          <CodeEditorWindow
            code={code}
            onChange={setCode}
            onChangeResult={handleRunCode}
            customRequestSchema={queryRequestSchema}
            customHeight="31vh"
          />
        </CardContent>
      )}
    </Card>
  );
};

SearchQualityPanel.propTypes = {
  collectionName: PropTypes.string,
  vectors: PropTypes.object.isRequired,
  loggingFoo: PropTypes.func,
  clearLogsFoo: PropTypes.func,
  other: PropTypes.object,
};

export default SearchQualityPanel;
