import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import get from 'lodash/get';
import ScatterGL from './ScatterGL';
import { generateColorBy } from './renderBy';

function buildGroups(points, payloadField, colors) {
  // Group points by payload value for the legend; group order is
  // alphabetical, matching the previous Chart.js legend
  const groupOfPoint = new Array(points.length);
  const groups = new Map();
  points.forEach((point, index) => {
    let label = get(point.payload, payloadField) + '';
    if (!label) {
      label = 'Unknown';
    }
    if (!groups.has(label)) {
      groups.set(label, { label, color: colors[index], pointIndices: [] });
    }
    groups.get(label).pointIndices.push(index);
    groupOfPoint[index] = label;
  });
  const sorted = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
  return { groups: sorted, groupOfPoint };
}

const VisualizeChart = ({
  requestResult, // Raw output of the request from qdrant client
  visualizationParams, // Parameters, as specified by the user in the input editor
  setActivePoint, // callback to set new active point
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const canvasRef = useRef(null);
  const scatterRef = useRef(null);
  const pointsRef = useRef([]);
  const groupOfPointRef = useRef(null);

  const [tooltip, setTooltip] = useState(null); // { x, y, id }
  const [legendGroups, setLegendGroups] = useState(null);
  const [hiddenGroups, setHiddenGroups] = useState(() => new Set());

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
          if (point && point.id !== undefined) {
            setActivePoint(point);
          }
        },
        onClick: (index) => {
          const point = pointsRef.current[index];
          if (point) {
            setActivePoint(point);
          }
        },
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
    const colors = generateColorBy(points, colorBy);
    const payloadField = typeof colorBy === 'string' ? colorBy : colorBy?.payload;

    scatter.setData(points.length);
    scatter.setColors(colors);

    if (payloadField) {
      const { groups, groupOfPoint } = buildGroups(points, payloadField, colors);
      groupOfPointRef.current = groupOfPoint;
      setLegendGroups(groups);
    } else {
      groupOfPointRef.current = null;
      setLegendGroups(null);
    }
    setHiddenGroups(new Set());
    setTooltip(null);

    const worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (m) => {
      if (m.data.error) {
        enqueueSnackbar(`Visualization Unsuccessful, error: ${m.data.error}`, {
          variant: 'error',
        });
      } else if (m.data.result && m.data.result.length > 0) {
        scatterRef.current?.updatePositions(m.data.result);
      } else {
        enqueueSnackbar(`Visualization Unsuccessful, error: Unexpected Error Occured`, { variant: 'error' });
      }
    };

    if (points.length > 0) {
      worker.postMessage({
        result: requestResult,
        params: visualizationParams,
      });
    }

    return () => {
      worker.terminate();
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
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
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
  activePoint: PropTypes.object,
  setActivePoint: PropTypes.func,
};

export default VisualizeChart;
