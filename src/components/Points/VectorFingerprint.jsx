import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { alpha, useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { computeVectorFingerprint } from '../../lib/vector-fingerprint';
import { blue, qdrantColor } from '../../theme/colors';

const CELL_COUNT = 32;
const WIDTH = 144;
const HEIGHT = 24;
const CELL_GAP = 1;

/**
 * Compact canvas "fingerprint" of a vector: a waveform-like strip of bars
 * around a center line, where each bar is a signed random projection of the
 * whole vector. Similar vectors produce visually similar silhouettes.
 * @param {Array|Object} vector - dense vector, multivector or sparse vector
 * @return {JSX.Element|null}
 * @constructor
 */
const VectorFingerprint = ({ vector }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const isDark = theme.palette.mode === 'dark';

  const fingerprint = useMemo(() => computeVectorFingerprint(vector, CELL_COUNT), [vector]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fingerprint) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const positiveColor = isDark ? qdrantColor[300] : qdrantColor[500];
    const negativeColor = isDark ? blue[300] : blue[700];
    const center = HEIGHT / 2;
    const maxBar = center - 1;
    const cellWidth = WIDTH / fingerprint.length;

    ctx.fillStyle = alpha(theme.palette.text.primary, 0.15);
    ctx.fillRect(0, center - 0.5, WIDTH, 1);

    for (let i = 0; i < fingerprint.length; i++) {
      const value = fingerprint[i];
      // a 1px stub keeps near-zero bars visible, so the strip reads as a
      // continuous waveform instead of scattered marks
      const barHeight = Math.max(1, Math.abs(value) * maxBar);
      ctx.fillStyle = value >= 0 ? positiveColor : negativeColor;
      if (value >= 0) {
        ctx.fillRect(i * cellWidth, center - barHeight, cellWidth - CELL_GAP, barHeight);
      } else {
        ctx.fillRect(i * cellWidth, center, cellWidth - CELL_GAP, barHeight);
      }
    }
  }, [fingerprint, isDark, theme]);

  if (!fingerprint) {
    return null;
  }

  return (
    <Tooltip title={'Vector fingerprint: similar vectors have similar fingerprints'} placement={'top'}>
      <canvas
        ref={canvasRef}
        style={{
          width: WIDTH,
          height: HEIGHT,
          verticalAlign: 'middle',
        }}
        role="img"
        aria-label="Vector fingerprint"
      />
    </Tooltip>
  );
};

VectorFingerprint.propTypes = {
  vector: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

export default VectorFingerprint;
