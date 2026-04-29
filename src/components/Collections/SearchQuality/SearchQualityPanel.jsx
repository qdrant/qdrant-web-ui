import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  FormControlLabel,
  Switch,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import Typography from '@mui/material/Typography';
import { SearchCheck } from 'lucide-react';
import { checkIndexRecall } from './check-index-precision';
import { useClient } from '../../../context/client-context';
import CodeEditorWindow from '../../FilterEditorWindow';

const VectorTableRow = ({ vectorObj, name, onCheckIndexQuality, recall, isInProgress, isDisabled }) => {
  return (
    <TableRow data-testid="vector-row">
      <TableCell>
        <Typography variant="subtitle1" component={'span'} color="text.secondary">
          {name == '' ? 'Default vector' : name}
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
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="subtitle1" component={'span'} color="text.secondary">
              {recall ? `${(recall * 100).toFixed(2)}%` : '—'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              aria-label="Check index quality"
              data-testid="index-quality-check-button"
              onClick={onCheckIndexQuality}
              disabled={isDisabled}
              startIcon={<SearchCheck size={18} />}
            >
              Check&nbsp;Index&nbsp;Quality
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
};

VectorTableRow.propTypes = {
  vectorObj: PropTypes.object,
  name: PropTypes.string,
  onCheckIndexQuality: PropTypes.func,
  recall: PropTypes.number,
  isDisabled: PropTypes.bool,
  isInProgress: PropTypes.bool,
};

const SAMPLE_SIZE = 100;

const SearchQualityPanel = ({ collectionName, vectors, loggingFoo, clearLogsFoo, ...other }) => {
  const { client } = useClient();
  const vectorsNames = Object.keys(vectors);
  const [recall, setRecall] = useState(() => {
    if (vectorsNames) {
      return vectorsNames.reduce((recall, name) => {
        recall[name] = null;
        return recall;
      }, {});
    }
    return null;
  });

  const [advancedMod, setAdvancedMod] = useState(false);
  const [inProgressVector, setInProgressVector] = useState(null);

  const [code, setCode] = useState(`
// Run this code to estimate ANN recall versus exact search
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
    setInProgressVector(using);

    clearLogsFoo && clearLogsFoo();
    const recalls = [];
    try {
      const sampleResult = await client.scroll(collectionName, {
        with_payload: false,
        with_vector: false,
        limit: SAMPLE_SIZE,
      });

      const pointIds = sampleResult.points.map((point) => point.id);
      const total = pointIds.length;

      loggingFoo &&
        loggingFoo(`Starting measuring recall@${limit} on ${total} requests for: ${using || 'Default vector'}`);

      for (let idx = 0; idx < total; idx++) {
        const pointId = pointIds[idx];
        const recall = await checkIndexRecall(
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
        if (recall !== null && !isNaN(recall)) {
          recalls.push(recall);
        }
      }

      // Round to 2 decimal places
      const round = (num) => Math.round((num + Number.EPSILON) * 10000) / 10000;

      const avgRecall = round(recalls.reduce((x, val) => x + val, 0) / recalls.length);
      // n-1 denominator: Bessel's correction for estimating population std dev from a sample
      const stdDev = round(Math.sqrt(recalls.reduce((x, val) => x + (val - avgRecall) ** 2, 0) / (recalls.length - 1)));

      loggingFoo('Mean recall@' + limit + ' for collection: ' + avgRecall + ' ± ' + stdDev);

      setRecall((prev) => {
        return {
          ...prev,
          [using]: avgRecall,
        };
      });

      setInProgressVector(null);
    } catch (e) {
      setInProgressVector(null);
      console.error(e);
      loggingFoo && loggingFoo(JSON.stringify(e));
    }
  };

  const handleRunCode = async (qulityCheckParams) => {
    onCheckIndexQuality(qulityCheckParams);
  };

  return (
    <Card elevation={0} data-testid="vectors-info" {...other}>
      <CardHeader
        title="ANN Recall"
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={
          <>
            <FormControlLabel
              sx={{ mr: 2 }}
              control={<Switch checked={advancedMod} onChange={() => setAdvancedMod(!advancedMod)} size="medium" />}
              label={
                <Typography component={'span'} variant={'body1'}>
                  Advanced Mode
                </Typography>
              }
            />
            <CopyButton text={advancedMod ? code : bigIntJSON.stringify(vectors)} />
          </>
        }
      />
      {!advancedMod && (
        <Table>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  borderBottom: 'none',
                },
              }}
            >
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
                  Recall
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              '& tr:last-of-type td': {
                borderBottom: 'none',
              },
            }}
          >
            {Object.keys(vectors).map((vectorName) => (
              <VectorTableRow
                vectorObj={vectors[vectorName]}
                name={vectorName}
                onCheckIndexQuality={() => onCheckIndexQuality({ using: vectorName })}
                recall={recall ? recall[vectorName] : null}
                key={vectorName}
                isInProgress={inProgressVector === vectorName}
                isDisabled={inProgressVector !== null && inProgressVector !== vectorName}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {advancedMod && (
        <CardContent sx={{ p: 0, pt: 1, height: '32vh' }} data-testid="advanced-mod-editor">
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
