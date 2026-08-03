import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Switch, InputLabel, Slider, Collapse, ButtonBase } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { ChevronDown } from 'lucide-react';
import NumberField from '../Common/NumberField';

const labelSx = {
  color: 'text.primary',
  fontWeight: 500,
  fontSize: '0.9375rem',
  lineHeight: 1.3,
};

const dimSx = (dimmed) => ({ opacity: dimmed ? 0.55 : 1, transition: 'opacity 0.2s ease' });

// Attention flicker played on a quota row when the user clicks the "Quota
// exceeded" chip, to point them at the offending metric.
const flicker = keyframes`
  0%, 100% { opacity: 1; }
  12.5%, 37.5%, 62.5% { opacity: 0.3; }
  25%, 50%, 75% { opacity: 1; }
`;

// A single quota setting laid out as a row: an icon, a label with a short
// description, its own enable/disable switch, and a control. On desktop the
// switch sits at the far right; on small screens it moves up beside the label
// and the control drops to its own line. When the row is off, its content dims
// but the switch stays fully interactive.
export function QuotaRow({ icon, label, description, htmlFor, enabled, onToggle, dimmed, flash, children }) {
  const [animate, setAnimate] = useState(false);
  // Restart the flicker each time `flash` changes (i.e. the chip is clicked
  // again), briefly clearing the animation so the browser replays it.
  useEffect(() => {
    if (!flash) return undefined;
    setAnimate(false);
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [flash]);

  return (
    <Box
      role="group"
      onAnimationEnd={() => setAnimate(false)}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        gap: { xs: 1.5, sm: 3 },
        animation: animate ? `${flicker} 0.9s ease-in-out` : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: { sm: 1 }, minWidth: 0 }}>
        <Switch
          size="small"
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
          inputProps={{ 'aria-label': `Enable ${label} quota` }}
          sx={{ flexShrink: 0 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0, ...dimSx(dimmed) }}>
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <InputLabel htmlFor={htmlFor} sx={labelSx} disabled={dimmed}>
              {label}
            </InputLabel>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {description}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width: { xs: '100%' },
          flex: { sm: '1.4 1 0%' },
          minWidth: 0,
          pl: { xs: 6.5, sm: 0 },
          ...dimSx(dimmed),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

QuotaRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  htmlFor: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  dimmed: PropTypes.bool,
  flash: PropTypes.number,
  children: PropTypes.node.isRequired,
};

// Colour for the "Current" usage number by status. 'ok' stays plain text so
// only the near-limit (amber) and exceeded (red) states draw the eye.
const USAGE_STATUS_COLOR = {
  ok: 'text.primary',
  warning: 'warning.main',
  exceeded: 'error.main',
  neutral: 'text.disabled',
};

const shortPeerId = (id) => `…${String(id).slice(-4)}`;

// Reduce the per-node quota usage from GET /quotas into a headline number.
// The quota is enforced per node, so the busiest node is what matters; fall
// back to the serving node's usage when the cluster is single-node.
export function summarizeUsage(status, key) {
  const entries = status && status.peers ? Object.entries(status.peers) : [];
  if (entries.length) {
    let peak = null;
    const peers = entries.map(([id, peer]) => {
      const percent = peer[key] ?? null;
      if (percent != null && (peak == null || percent > peak)) peak = percent;
      return { id, percent };
    });
    return { percent: peak, peers, distributed: true };
  }
  return { percent: status?.usage?.[key] ?? null, peers: [], distributed: false };
}

// Classify current usage against the configured limit (minus the release
// margin) so the meter can colour itself. 'neutral' while the quota is off.
export function usageStatus(percent, limit, margin, enabled) {
  if (!enabled || limit == null || percent == null) return 'neutral';
  if (percent >= limit) return 'exceeded';
  if (percent >= limit - (margin ?? 0)) return 'warning';
  return 'ok';
}

// One node's usage inside the "Usage by node" disclosure: a mini bar coloured
// red when that node is over the configured limit.
function PeerUsageRow({ peer, limitPercent, showLimit }) {
  const known = peer.percent != null;
  const over = showLimit && limitPercent != null && known && peer.percent >= limitPercent;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ width: 96, flexShrink: 0, whiteSpace: 'nowrap' }}>
        Node {shortPeerId(peer.id)}
      </Typography>
      <Box sx={{ flex: 1, position: 'relative', height: 6 }}>
        <Box sx={{ position: 'absolute', inset: 0, borderRadius: 3, backgroundColor: 'action.hover' }} />
        {known && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: `${Math.min(100, peer.percent)}%`,
              borderRadius: 3,
              backgroundColor: over ? 'error.main' : 'primary.main',
            }}
          />
        )}
        {showLimit && limitPercent != null && (
          <Box
            sx={{
              position: 'absolute',
              top: -2,
              bottom: -2,
              left: `${limitPercent}%`,
              width: '2px',
              transform: 'translateX(-1px)',
              borderRadius: 1,
              backgroundColor: 'text.secondary',
              opacity: 0.6,
            }}
          />
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          width: 40,
          flexShrink: 0,
          textAlign: 'right',
          fontWeight: 600,
          color: over ? 'error.main' : 'text.primary',
        }}
      >
        {known ? `${peer.percent}%` : '—'}
      </Typography>
    </Box>
  );
}

PeerUsageRow.propTypes = {
  peer: PropTypes.object.isRequired,
  limitPercent: PropTypes.number,
  showLimit: PropTypes.bool,
};

// Merged limit + usage control for a percentage quota: one slider whose thumb
// sets the limit (edited precisely in the "New" field) and whose coloured mark
// shows current cluster usage ("Current"). In a cluster, a collapsible section
// breaks usage down per node.
export function PercentQuotaControl({ id, label, value, onChange, disabled, usage, status, peers, distributed }) {
  const [nodesOpen, setNodesOpen] = useState(false);
  const statusColor = usage != null ? USAGE_STATUS_COLOR[status] : 'text.disabled';
  const usageKnown = usage != null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, sm: 3 } }}>
        <Box sx={{ flex: 1, minWidth: 0, px: 0.5 }}>
          {/* Empty caption keeps the same top offset as the Current/New columns,
              so the slider track lands level with those values. */}
          <Typography
            aria-hidden
            variant="caption"
            sx={{ display: 'block', lineHeight: 1.2, mb: 0.5, visibility: 'hidden' }}
          >
            &nbsp;
          </Typography>
          <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
            <Slider
              value={typeof value === 'number' ? value : 0}
              onChange={(_, next) => onChange(next)}
              disabled={disabled}
              min={0}
              max={100}
              track={false}
              valueLabelDisplay="auto"
              aria-label={`${label} limit`}
              marks={usageKnown ? [{ value: usage, label: `${usage}%` }] : []}
              sx={{
                flex: 1,
                py: 0.5,
                // Marks add a reserved bottom margin that pushes the track up
                // when centred; drop it so the track lines up with the values.
                '&.MuiSlider-marked': { mb: 0 },
                '& .MuiSlider-markLabel': {
                  top: -18,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                },
                '& .MuiSlider-mark': {
                  height: 14,
                  width: 3,
                  borderRadius: 1,
                  backgroundColor: 'text.secondary',
                  opacity: disabled ? 0.4 : 1,
                },
              }}
            />
          </Box>
        </Box>

        {/* Current usage vs. new limit, aligned like a two-column table */}
        <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.5 }}>
              Usage
            </Typography>
            <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <Typography component="span" sx={{ fontWeight: 600, fontSize: '1rem', color: statusColor }}>
                {usageKnown ? `${usage}%` : '—'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: 96 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.5 }}>
              Threshold
            </Typography>
            <NumberField
              id={id}
              value={value}
              onValueChange={onChange}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              suffix="%"
              ariaLabel={`${label} limit value`}
            />
          </Box>
        </Box>
      </Box>

      {distributed && peers.length > 0 && (
        <Box>
          <ButtonBase
            onClick={() => setNodesOpen((open) => !open)}
            aria-expanded={nodesOpen}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.secondary',
              borderRadius: 1,
              px: 0.5,
              py: 0.25,
              '&:hover': { color: 'text.primary' },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Usage by node
            </Typography>
            <ChevronDown
              size={14}
              style={{ transform: nodesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            />
          </ButtonBase>
          <Collapse in={nodesOpen}>
            <Box sx={{ pt: 1, pb: 0.5, pl: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {peers.map((peer) => (
                <PeerUsageRow key={peer.id} peer={peer} limitPercent={value} showLimit={!disabled} />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

PercentQuotaControl.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  usage: PropTypes.number,
  status: PropTypes.oneOf(['ok', 'warning', 'exceeded', 'neutral']).isRequired,
  peers: PropTypes.arrayOf(PropTypes.object),
  distributed: PropTypes.bool,
};
