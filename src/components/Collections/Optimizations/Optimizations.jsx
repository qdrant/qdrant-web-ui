import React, { memo, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { ChevronDown, ChevronRight } from 'lucide-react';
import yellow from '../../../theme/colors/yellow';
import { CopyButton } from '../../Common/CopyButton';

const MOCK_REQUEST_TIME = "2025-12-09T16:10:49.069118878Z";

const MOCK_DATA = {
  "result": {
    "ongoing": [
      {
        "name": "Segment Optimizing",
        "started_at": "2025-12-09T16:10:35.306209563Z",
        "children": [
          {
            "name": "copy_data",
            "started_at": "2025-12-09T16:10:35.770113084Z",
            "finished_at": "2025-12-09T16:10:36.436875562Z",
            "duration_sec": 0.666761967
          },
          {
            "name": "populate_vector_storages",
            "started_at": "2025-12-09T16:10:36.436877916Z",
            "finished_at": "2025-12-09T16:10:36.448025542Z",
            "duration_sec": 0.011147576
          },
          {
            "name": "wait_cpu_permit",
            "started_at": "2025-12-09T16:10:36.448025652Z",
            "finished_at": "2025-12-09T16:10:36.550934293Z",
            "duration_sec": 0.102908391
          },
          {
            "name": "quantization",
            "started_at": "2025-12-09T16:10:36.762077445Z",
            "finished_at": "2025-12-09T16:10:37.668719603Z",
            "duration_sec": 0.906642008,
            "children": [
              {
                "name": "",
                "started_at": "2025-12-09T16:10:36.762080038Z",
                "finished_at": "2025-12-09T16:10:37.668718551Z",
                "duration_sec": 0.906638102
              }
            ]
          },
          {
            "name": "payload_index",
            "started_at": "2025-12-09T16:10:37.688295820Z",
            "finished_at": "2025-12-09T16:10:39.011844851Z",
            "duration_sec": 1.32354822,
            "children": [
              {
                "name": "text:t",
                "started_at": "2025-12-09T16:10:37.706390813Z",
                "finished_at": "2025-12-09T16:10:39.011844069Z",
                "duration_sec": 1.305452586
              }
            ]
          },
          {
            "name": "vector_index",
            "started_at": "2025-12-09T16:10:39.018015470Z",
            "children": [
              {
                "name": "",
                "started_at": "2025-12-09T16:10:39.018019196Z",
                "children": [
                  {
                    "name": "migrate",
                    "started_at": "2025-12-09T16:10:39.029945562Z",
                    "finished_at": "2025-12-09T16:10:39.069118287Z",
                    "duration_sec": 0.039172585
                  },
                  {
                    "name": "main_graph",
                    "started_at": "2025-12-09T16:10:39.069118878Z",
                    "done": 9207,
                    "total": 17500
                  },
                  {
                    "name": "additional_links",
                    "children": [
                      {
                        "name": "text:t"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "name": "sparse_vector_index"
          }
        ]
      },
    ],
  },
  "status": "ok",
  "time": 0.000049674
};

const parseTime = (t) => new Date(t).getTime();

const getTreeTimeRange = (nodes) => {
  let min = Infinity;
  let max = -Infinity;

  const traverse = (node) => {
    if (node.started_at) {
      const start = parseTime(node.started_at);
      if (start < min) min = start;
      if (start > max) max = start;

      if (node.finished_at) {
        const end = parseTime(node.finished_at);
        if (end > max) max = end;
      }
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return { min, max };
};

const enrichWithDuration = (nodes, maxTime) => {
  return nodes.map((node) => {
    const newNode = { ...node };
    let duration = 0;
    let isExplicitDuration = false;

    // Logic for leaf/task progress based duration estimation
    // If not finished, and we have done/total, we can estimate "progress duration"
    // However, the prompt asks to "show done/total". 
    // It also says "account for this in the summarized parents nodes".
    // This implies we need to sum up "done" and "total" for parents too if they don't have it.

    // First pass: calculate duration if explicit
    if (newNode.duration_sec) {
      duration = newNode.duration_sec * 1000;
      isExplicitDuration = true;
    } else if (newNode.started_at) {
      const start = parseTime(newNode.started_at);
      const end = newNode.finished_at ? parseTime(newNode.finished_at) : maxTime;
      duration = end - start;
      isExplicitDuration = true;
    }

    let childrenSumDone = 0;
    let childrenSumTotal = 0;
    let hasChildrenWithProgress = false;

    if (newNode.children && newNode.children.length > 0) {
      newNode.children = enrichWithDuration(newNode.children, maxTime);
      
      // Sum children stats
      newNode.children.forEach(child => {
          if (child.total > 0) {
              childrenSumDone += (child.done || 0);
              childrenSumTotal += child.total;
              hasChildrenWithProgress = true;
          }
          if (!isExplicitDuration) {
             duration += (child.duration || 0);
          }
      });
    }

    // If node doesn't have own done/total, but children do, inherit the sum
    if (newNode.total === undefined && hasChildrenWithProgress) {
        newNode.done = childrenSumDone;
        newNode.total = childrenSumTotal;
    }

    newNode.duration = duration;
    return newNode;
  });
};

const OptimizationNode = ({ node, level = 0, totalDuration, maxTime }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Use pre-calculated duration
  const duration = node.duration || 0;
  const isFinished = !!node.finished_at;

  // Calculate visual width percentage based on duration
  // Ensure at least a small width for visibility if duration is tiny but > 0
  const widthPercent = totalDuration ? Math.max((duration / totalDuration) * 100, 0.5) : 0;
  
  // For the progress bar itself (the fill inside the allocated width):
  // If finished, it's 100% filled.
  // If not finished, we estimate progress based on done/total if available.
  // If no done/total, we keep it solid (100%) as we don't know how far along it is.
  let fillPercent = 100;
  if (!isFinished && node.total > 0 && node.done !== undefined) {
      fillPercent = (node.done / node.total) * 100;
  }

  // Progress percentage text
  let progressText = '';
  
  // Prioritize showing done/total if available and not finished
  if (!node.started_at) {
    progressText = 'pending';
  } else if (duration > 0) {
    // Show duration for everything else (even if not finished, but started)
    if (duration < 1000) {
        progressText = `${Math.round(duration)}ms`;
    } else if (duration < 60000) {
        progressText = `${(duration / 1000).toFixed(2)}s`;
    } else {
        progressText = `${(duration / 60000).toFixed(2)}m`;
    }
  }

  const handleToggle = () => {
    setOpen(!open);
  };

  const barColor = isFinished ? theme.palette.success.main : yellow[700];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 0.5,
          pl: level * 2,
          '&:hover': {
            bgcolor: theme.palette.action.hover,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden', mr: 2 }}>
          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {hasChildren && (
              <IconButton size="small" onClick={handleToggle} sx={{ p: 0.5 }}>
                {open ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </IconButton>
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{ ml: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {node.name ||
              (level === 0 ? (
                'Optimizations'
              ) : (
                <Typography component="span" variant="body2" fontStyle="italic">
                  default
                </Typography>
              ))}
          </Typography>
        </Box>

        {(duration > 0 || progressText) && (!hasChildren || !open) && (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '300px', flexShrink: 0 }}>
            {/* Bar container */}
            <Box
              sx={{
                width: '100%',
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  bgcolor: 'transparent',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {progressText !== 'pending' && (
                  <LinearProgress
                    variant="determinate"
                    value={fillPercent} // Fill based on done/total or 100%
                    sx={{
                      width: `${widthPercent}%`,
                      height: 12,
                      borderRadius: 2,
                      bgcolor: alpha(barColor, 0.2), // Track is lighter version of bar color
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: barColor,
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ minWidth: 60, textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                {progressText}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box>
            {node.children.map((child, index) => (
              <OptimizationNode
                key={index}
                node={child}
                level={level + 1}
                totalDuration={totalDuration}
                maxTime={maxTime}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

OptimizationNode.propTypes = {
  node: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
    finished_at: PropTypes.string,
    started_at: PropTypes.string,
    duration_sec: PropTypes.number,
    done: PropTypes.number,
    total: PropTypes.number,
    duration: PropTypes.number,
  }).isRequired,
  level: PropTypes.number,
  totalDuration: PropTypes.number,
  maxTime: PropTypes.number,
};

const Optimizations = ({ collectionName, ...other }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Mock API call
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
    }, 500);
    return () => clearTimeout(timer);
  }, [collectionName]);

  const { enrichedNodes, totalDuration, maxTime } = useMemo(() => {
    if (!data || !data.result || !data.result.ongoing)
      return { enrichedNodes: [], totalDuration: 0, maxTime: 0 };
    const { min, max } = getTreeTimeRange(data.result.ongoing);
    // If we only have start times or empty, handle safely
    if (min === Infinity || max === -Infinity)
      return { enrichedNodes: [], totalDuration: 0, maxTime: 0 };

    // Use mock request time as the global "current time" end for ongoing tasks
    const requestTime = parseTime(MOCK_REQUEST_TIME);
    const end = Math.max(max, requestTime);
    
    // Add a small buffer to max time if it equals min (e.g. single start event)
    const totalDur = Math.max(end - min, 1000); // Ensure at least 1s duration if instant

    const enriched = enrichWithDuration(data.result.ongoing, end);

    return {
      enrichedNodes: enriched,
      totalDuration: totalDur,
      maxTime: end,
    };
  }, [data]);

  return (
    <Card elevation={0} {...other}>
      <CardHeader
        title={'Optimizations Tree'}
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={<CopyButton text={JSON.stringify(data)} />}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box
          sx={{
            overflow: 'auto',
            borderRadius: 1,
            p: 1,
          }}
        >
          {enrichedNodes.length > 0 ? (
            enrichedNodes.map((node, index) => (
              <OptimizationNode
                key={index}
                node={node}
                totalDuration={totalDuration}
                maxTime={maxTime}
              />
            ))
          ) : !data ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Loading optimizations...
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No ongoing optimizations
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Optimizations.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Optimizations);
