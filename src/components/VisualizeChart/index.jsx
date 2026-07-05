import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ScatterGL from './ScatterGL';
import { generateColorBy, generateGroupsAndColors } from './renderBy';

const VisualizeChart = ({
  requestResult, // Raw output of the request from qdrant client
  visualizationParams, // Parameters, as specified by the user in the input editor
  onPointSelect, // callback: point clicked (null for a click on empty space)
  onBoxSelect, // callback: array of points selected with shift+drag
  focusIds, // ids of points to emphasize (all others get dimmed), or null
  selectionCount, // number of points in the active selection, if any
  onSelectionClear, // callback: the selection chip was closed
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const canvasRef = useRef(null);
  const scatterRef = useRef(null);
  const pointsRef = useRef([]);
  const groupOfPointRef = useRef(null);
  // Callbacks are captured by ScatterGL once at mount, keep them fresh
  const callbacksRef = useRef({});
  callbacksRef.current = { onPointSelect, onBoxSelect };

  const [tooltip, setTooltip] = useState(null); // { x, y, id }
  const [legendGroups, setLegendGroups] = useState(null);
  const [hiddenGroups, setHiddenGroups] = useState(() => new Set());
  const [boxRect, setBoxRect] = useState(null);
  const [progress, setProgress] = useState(null); // { step, total } while the layout runs
  const workerRef = useRef(null);

  const stopLayout = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setProgress(null);
  };

  // Create the WebGL renderer once per mount
  useEffect(() => {
    let scatter;
    try {
      scatter = new ScatterGL(canvasRef.current, {
        onHover: (index, x, y) => {
          scatter.setHighlight(index);
          if (index === null) {
            setTooltip(null);
            return;
          }
          const point = pointsRef.current[index];
          setTooltip({ x, y, id: point?.id });
        },
        onClick: (index) => {
          const point = index === null ? null : pointsRef.current[index];
          callbacksRef.current.onPointSelect?.(point ?? null);
        },
        onBoxSelect: (indices) => {
          const points = indices.map((index) => pointsRef.current[index]).filter(Boolean);
          callbacksRef.current.onBoxSelect?.(points);
        },
        onBoxRect: (rect) => setBoxRect(rect),
      });
    } catch (e) {
      enqueueSnackbar(`Visualization is not available: ${e.message}`, { variant: 'error' });
      return undefined;
    }
    scatterRef.current = scatter;
    return () => {
      scatterRef.current = null;
      scatter.destroy();
    };
  }, []);

  // New request result: recolor, respawn the layout worker
  useEffect(() => {
    const scatter = scatterRef.current;
    if (!requestResult.points || !scatter) {
      return;
    }

    const points = requestResult.points;
    pointsRef.current = points;

    const colorBy = visualizationParams?.color_by;
    const payloadField = typeof colorBy === 'string' ? colorBy : colorBy?.payload;

    scatter.setData(points.length);

    if (payloadField) {
      const { colors, groups, groupOfPoint } = generateGroupsAndColors(points, payloadField);
      scatter.setColors(colors);
      groupOfPointRef.current = groupOfPoint;
      setLegendGroups(groups);
    } else {
      scatter.setColors(generateColorBy(points, colorBy));
      groupOfPointRef.current = null;
      setLegendGroups(null);
    }
    setHiddenGroups(new Set());
    setTooltip(null);

    const worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (m) => {
      if (m.data.error) {
        setProgress(null);
        enqueueSnackbar(`Visualization Unsuccessful, error: ${m.data.error}`, {
          variant: 'error',
        });
      } else if (m.data.result && m.data.result.length > 0) {
        scatterRef.current?.updatePositions(m.data.result);
        if (m.data.done) {
          setProgress(null);
        } else if (m.data.progress) {
          setProgress(m.data.progress);
        }
      } else {
        setProgress(null);
        enqueueSnackbar(`Visualization Unsuccessful, error: Unexpected Error Occured`, { variant: 'error' });
      }
    };

    if (points.length > 0) {
      worker.postMessage({
        result: requestResult,
        params: visualizationParams,
      });
      setProgress({ step: 0, total: null });
    }

    return () => {
      worker.terminate();
      workerRef.current = null;
      setProgress(null);
    };
  }, [requestResult]);

  // Apply legend visibility toggles
  useEffect(() => {
    const scatter = scatterRef.current;
    const groupOfPoint = groupOfPointRef.current;
    if (!scatter || scatter.n === 0) {
      return;
    }
    if (!groupOfPoint || hiddenGroups.size === 0) {
      scatter.setVisibility(null);
      return;
    }
    const visible = new Uint8Array(groupOfPoint.length);
    for (let i = 0; i < groupOfPoint.length; i++) {
      visible[i] = hiddenGroups.has(groupOfPoint[i]) ? 0 : 1;
    }
    scatter.setVisibility(visible);
  }, [hiddenGroups, legendGroups]);

  // Emphasize the given point ids (nearest neighbors of a selection or
  // a highlight filter match) by dimming everything else
  useEffect(() => {
    const scatter = scatterRef.current;
    if (!scatter || scatter.n === 0) {
      return;
    }
    if (!focusIds || focusIds.length === 0) {
      scatter.setFocus(null);
      return;
    }
    const idSet = new Set(focusIds.map((id) => String(id)));
    const indices = [];
    pointsRef.current.forEach((point, index) => {
      if (idSet.has(String(point.id))) {
        indices.push(index);
      }
    });
    scatter.setFocus(indices);
  }, [focusIds, requestResult]);

  const toggleGroup = (label) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {legendGroups && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1.5,
            px: 2,
            py: 0.5,
            pointerEvents: 'none',
          }}
        >
          {legendGroups.map((group) => (
            <Box
              key={group.label}
              onClick={() => toggleGroup(group.label)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                pointerEvents: 'auto',
                opacity: hiddenGroups.has(group.label) ? 0.4 : 1,
              }}
            >
              <Box sx={{ width: 20, height: 10, backgroundColor: group.color, borderRadius: '2px' }} />
              <Typography
                variant="caption"
                sx={{ textDecoration: hiddenGroups.has(group.label) ? 'line-through' : 'none' }}
              >
                {group.label}
                {typeof group.count === 'number' ? ` (${group.count})` : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      {selectionCount > 0 && (
        <Chip
          size="small"
          color="primary"
          label={`${selectionCount} points selected`}
          onDelete={onSelectionClear}
          sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 2 }}
        />
      )}
      {progress && (
        <Tooltip title="Layout is running, press to stop it and keep the current picture">
          <Chip
            size="small"
            variant="outlined"
            label={
              progress.total
                ? `Layout: ${Math.round((progress.step / progress.total) * 100)}%`
                : `Layout: iteration ${progress.step}`
            }
            onDelete={stopLayout}
            sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 2, backdropFilter: 'blur(2px)' }}
          />
        </Tooltip>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {boxRect && (
        <Box
          sx={{
            position: 'absolute',
            left: boxRect.left,
            top: boxRect.top,
            width: boxRect.width,
            height: boxRect.height,
            border: `1px dashed ${theme.palette.primary.main}`,
            backgroundColor: 'rgba(128, 128, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}
      {tooltip && (
        <Box
          sx={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            zIndex: 3,
            pointerEvents: 'none',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: 2,
            px: 1,
            py: 0.25,
          }}
        >
          <Typography variant="caption">Point {String(tooltip.id)}</Typography>
        </Box>
      )}
    </Box>
  );
};

VisualizeChart.propTypes = {
  requestResult: PropTypes.object.isRequired,
  visualizationParams: PropTypes.object.isRequired,
  onPointSelect: PropTypes.func,
  onBoxSelect: PropTypes.func,
  focusIds: PropTypes.array,
  selectionCount: PropTypes.number,
  onSelectionClear: PropTypes.func,
};

export default VisualizeChart;
