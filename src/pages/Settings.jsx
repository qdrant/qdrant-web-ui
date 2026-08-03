import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Switch,
  InputLabel,
  Divider,
  Button,
  Slider,
  Collapse,
  ButtonBase,
  Tooltip,
  Chip,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import { MemoryStick, HardDrive, Database, TriangleAlert, ChevronDown } from 'lucide-react';
import NumberField from '../components/Common/NumberField';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { PAGE_CONTENT_WIDTH } from '../theme/constants';

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
function QuotaRow({ icon, label, description, htmlFor, enabled, onToggle, dimmed, flash, children }) {
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

const USAGE_STATUS_COLOR = {
  ok: 'success.main',
  warning: 'warning.main',
  exceeded: 'error.main',
  neutral: 'text.disabled',
};

const shortPeerId = (id) => `…${String(id).slice(-4)}`;

// Reduce the per-node quota usage from GET /quotas into a headline number.
// The quota is enforced per node, so the busiest node is what matters; fall
// back to the serving node's usage when the cluster is single-node.
function summarizeUsage(status, key) {
  const entries = status.peers ? Object.entries(status.peers) : [];
  if (entries.length) {
    let peak = null;
    const peers = entries.map(([id, peer]) => {
      const percent = peer[key] ?? null;
      if (percent != null && (peak == null || percent > peak)) peak = percent;
      return { id, percent };
    });
    return { percent: peak, peers, distributed: true };
  }
  return { percent: status.usage?.[key] ?? null, peers: [], distributed: false };
}

// Classify current usage against the configured limit (minus the release
// margin) so the meter can colour itself. 'neutral' while the quota is off.
function usageStatus(percent, limit, margin, enabled) {
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
              backgroundColor: over ? 'error.main' : 'success.main',
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
function PercentQuotaControl({ id, label, value, onChange, disabled, usage, status, peers, distributed }) {
  const [nodesOpen, setNodesOpen] = useState(false);
  const statusColor = usage != null ? USAGE_STATUS_COLOR[status] : 'text.disabled';
  const usageKnown = usage != null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, sm: 3 } }}>
        <Box sx={{ flex: 1, minWidth: 0, px: 0.5, pt: 2.75 }}>
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
              py: 1,
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

        {/* Current usage vs. new limit, aligned like a two-column table */}
        <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexShrink: 0 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.5 }}>
              Current
            </Typography>
            <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <Typography component="span" sx={{ fontWeight: 600, fontSize: '1rem', color: statusColor }}>
                {usageKnown ? `${usage}%` : '—'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: 96 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.5 }}>
              New
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
            <Box sx={{ pt: 1, pb: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
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

const INITIAL_QUOTAS = {
  quotasEnabled: false,
  memoryEnabled: false,
  diskEnabled: false,
  collectionsEnabled: false,
  memory: 80,
  disk: 80,
  maxCollections: null,
};

// Value to pre-fill the collections field with the first time the collections
// quota is enabled without a value already set.
const DEFAULT_MAX_COLLECTIONS = 10000;

// Live cluster quota usage, shaped like the `result` of `GET /quotas`
// (qdrant PR #10035): per-node resident-memory and disk percentages plus an
// `exceeded` flag. Sample data for now — swap for the API response once wired.
// `peers` is absent on single-node deployments; `usage` is the serving node.
const QUOTA_STATUS = {
  config: {
    enabled: false,
    max_resident_memory_percent: 80,
    max_disk_usage_percent: 80,
    release_margin_percent: 5,
  },
  usage: { resident_memory_percent: 71, disk_usage_percent: 44 },
  peers: {
    5644950770669488: { resident_memory_percent: 71, disk_usage_percent: 44, exceeded: false },
    5255497362296823: { resident_memory_percent: 88, disk_usage_percent: 39, exceeded: true },
    8741461806010521: { resident_memory_percent: 63, disk_usage_percent: 52, exceeded: false },
  },
};

function Settings() {
  // The whole card is a draft: switches and values change freely and are only
  // committed to `saved` when the user clicks Save. Comparing the two tells us
  // whether there are unsaved changes.
  const [draft, setDraft] = useState(INITIAL_QUOTAS);
  const [saved, setSaved] = useState(INITIAL_QUOTAS);
  // Set on each "Quota exceeded" chip click: a bumped nonce plus a snapshot of
  // which rows were exceeded at that moment, so the flicker fires only on click
  // — not when a limit change makes a metric cross its threshold.
  const [flash, setFlash] = useState({ nonce: 0, memory: false, disk: false });

  const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

  const memoryActive = draft.quotasEnabled && draft.memoryEnabled;
  const diskActive = draft.quotasEnabled && draft.diskEnabled;
  const collectionsActive = draft.quotasEnabled && draft.collectionsEnabled;
  const hasUnsavedChanges =
    draft.quotasEnabled !== saved.quotasEnabled ||
    draft.memoryEnabled !== saved.memoryEnabled ||
    draft.diskEnabled !== saved.diskEnabled ||
    draft.collectionsEnabled !== saved.collectionsEnabled ||
    draft.memory !== saved.memory ||
    draft.disk !== saved.disk ||
    draft.maxCollections !== saved.maxCollections;

  // Pre-fills the collections field with a default the first time its quota is
  // enabled while empty, so an enabled quota always has a concrete cap.
  const collectionsDefault = (enabling) =>
    enabling && draft.maxCollections == null ? { maxCollections: DEFAULT_MAX_COLLECTIONS } : {};

  // The master switch enables/disables every quota at once, keeping the
  // invariant that no individual quota is on while quotas are globally off.
  const toggleMaster = (next) => {
    patch({
      quotasEnabled: next,
      memoryEnabled: next,
      diskEnabled: next,
      collectionsEnabled: next,
      ...collectionsDefault(next),
    });
  };

  // Turning a single quota on while quotas are globally off also turns quotas on.
  const toggleRow = (key, next) => {
    patch({
      [key]: next,
      ...(next && !draft.quotasEnabled ? { quotasEnabled: true } : {}),
      ...(key === 'collectionsEnabled' ? collectionsDefault(next) : {}),
    });
  };

  const save = () => setSaved(draft);
  const discard = () => setDraft(saved);

  // Current cluster usage vs. the (draft) limits, so the control gives live
  // feedback while the slider moves.
  const margin = QUOTA_STATUS.config.release_margin_percent;
  const memoryUsage = summarizeUsage(QUOTA_STATUS, 'resident_memory_percent');
  const diskUsage = summarizeUsage(QUOTA_STATUS, 'disk_usage_percent');
  const memoryExceeded = usageStatus(memoryUsage.percent, draft.memory, margin, memoryActive) === 'exceeded';
  const diskExceeded = usageStatus(diskUsage.percent, draft.disk, margin, diskActive) === 'exceeded';
  const exceededResources = [memoryExceeded && 'memory', diskExceeded && 'disk'].filter(Boolean);
  const exceededMessage = exceededResources.length
    ? `${exceededResources.join(' and ').replace(/^./, (c) => c.toUpperCase())} usage ${
        exceededResources.length > 1 ? 'have' : 'has'
      } exceeded the configured quota on at least one node.`
    : null;

  return (
    <CenteredFrame>
      <Grid container maxWidth={PAGE_CONTENT_WIDTH.narrow} width={'100%'} spacing={3}>
        <Grid size={12}>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box display="flex" flexDirection="column" gap={5}>
            <Card elevation={0}>
              <CardHeader
                title={
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    Quotas
                    {exceededMessage && (
                      <Tooltip title={`${exceededMessage} Click to locate.`} arrow>
                        <Chip
                          size="small"
                          icon={<TriangleAlert size={13} />}
                          label="Quota exceeded"
                          onClick={() =>
                            setFlash((f) => ({ nonce: f.nonce + 1, memory: memoryExceeded, disk: diskExceeded }))
                          }
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'warning.main',
                            backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.16),
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.28),
                            },
                            '& .MuiChip-icon': { color: 'inherit', ml: 0.75 },
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                }
                variant="heading"
                sx={{ flexGrow: 1 }}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: draft.quotasEnabled ? 'text.secondary' : 'text.primary', fontWeight: 500 }}
                    >
                      Off
                    </Typography>
                    <Switch
                      checked={draft.quotasEnabled}
                      onChange={(event) => toggleMaster(event.target.checked)}
                      inputProps={{ 'aria-label': 'Enable quotas' }}
                    />
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: draft.quotasEnabled ? 'text.primary' : 'text.secondary', fontWeight: 500 }}
                    >
                      On
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} role="form">
                  <Typography variant="body2" color="text.secondary">
                    Cap how much memory and disk this instance may use, and how many collections it may hold.
                  </Typography>

                  <QuotaRow
                    icon={<MemoryStick size="1.25rem" />}
                    label="Memory"
                    description="Share of available RAM this instance may use."
                    htmlFor="memory-quota"
                    enabled={draft.memoryEnabled}
                    onToggle={(next) => toggleRow('memoryEnabled', next)}
                    dimmed={!memoryActive}
                    flash={flash.memory ? flash.nonce : 0}
                  >
                    <PercentQuotaControl
                      id="memory-quota"
                      label="Memory"
                      value={draft.memory}
                      onChange={(value) => patch({ memory: value })}
                      disabled={!memoryActive}
                      usage={memoryUsage.percent}
                      status={usageStatus(memoryUsage.percent, draft.memory, margin, memoryActive)}
                      peers={memoryUsage.peers}
                      distributed={memoryUsage.distributed}
                    />
                  </QuotaRow>

                  <Divider />

                  <QuotaRow
                    icon={<HardDrive size="1.25rem" />}
                    label="Disk space"
                    description="Share of available disk this instance may use."
                    htmlFor="disk-quota"
                    enabled={draft.diskEnabled}
                    onToggle={(next) => toggleRow('diskEnabled', next)}
                    dimmed={!diskActive}
                    flash={flash.disk ? flash.nonce : 0}
                  >
                    <PercentQuotaControl
                      id="disk-quota"
                      label="Disk space"
                      value={draft.disk}
                      onChange={(value) => patch({ disk: value })}
                      disabled={!diskActive}
                      usage={diskUsage.percent}
                      status={usageStatus(diskUsage.percent, draft.disk, margin, diskActive)}
                      peers={diskUsage.peers}
                      distributed={diskUsage.distributed}
                    />
                  </QuotaRow>

                  <Divider />

                  <QuotaRow
                    icon={<Database size="1.25rem" />}
                    label="Collections"
                    description="Maximum number of collections allowed."
                    htmlFor="max-collections"
                    enabled={draft.collectionsEnabled}
                    onToggle={(next) => toggleRow('collectionsEnabled', next)}
                    dimmed={!collectionsActive}
                  >
                    <Box sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
                      <Box sx={{ width: { xs: '100%', sm: 200 } }}>
                        <NumberField
                          id="max-collections"
                          value={draft.collectionsEnabled ? draft.maxCollections : null}
                          onValueChange={(value) => patch({ maxCollections: value })}
                          min={0}
                          step={1}
                          disabled={!collectionsActive}
                          placeholder="Unlimited"
                          ariaLabel="Maximum number of collections"
                        />
                      </Box>
                    </Box>
                  </QuotaRow>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mr: 'auto', visibility: hasUnsavedChanges ? 'visible' : 'hidden' }}
                    >
                      You have unsaved changes.
                    </Typography>
                    <Button variant="text" color="inherit" onClick={discard} disabled={!hasUnsavedChanges}>
                      Discard
                    </Button>
                    <Button variant="contained" onClick={save} disabled={!hasUnsavedChanges}>
                      Save changes
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </CenteredFrame>
  );
}

export default Settings;
