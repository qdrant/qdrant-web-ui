import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Switch,
  Divider,
  Button,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MemoryStick, HardDrive, TriangleAlert } from 'lucide-react';
import { axiosInstance as axios } from '../../common/axios';
import { QuotaRow, PercentQuotaControl } from './QuotaControls';
import { configToForm, formToConfig, summarizeUsage, usageStatus } from './quotaHelpers';

// Fallback release margin when the API doesn't report one; used for the
// near-limit ("warning") band on the usage meters.
const DEFAULT_RELEASE_MARGIN = 5;

const readErrorMessage = (err) =>
  err?.response?.data?.status?.error || err?.message || 'Failed to reach the quotas API.';

function QuotasCard() {
  // Latest GET /quotas result ({ config, usage, peers }); refreshed on a timer
  // so the usage meters stay live.
  const [status, setStatus] = useState(null);
  // Editable form derived from the config, plus the last-saved baseline so we
  // know when there are unsaved changes. `null` until the first load.
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Set on each "Quota exceeded" chip click: a bumped nonce plus a snapshot of
  // which rows were exceeded at that moment, so the flicker fires only on click.
  const [flash, setFlash] = useState({ nonce: 0, memory: false, disk: false });

  // Fetch the quota status. `initForm` seeds the editable form on first load;
  // background refreshes only update the usage meters, never the form.
  const loadStatus = useCallback(async ({ initForm = false } = {}) => {
    const result = (await axios.get('/quotas')).data?.result ?? {};
    setStatus(result);
    if (initForm) {
      const form = configToForm(result.config);
      setDraft(form);
      setSaved(form);
    }
    return result;
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadStatus({ initForm: true })
      .then(() => active && setError(null))
      .catch((err) => active && setError(readErrorMessage(err)))
      .finally(() => active && setLoading(false));
    const interval = setInterval(() => loadStatus().catch(() => {}), 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [loadStatus]);

  const releaseMargin = status?.config?.release_margin_percent ?? DEFAULT_RELEASE_MARGIN;

  const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

  // The master switch enables/disables every quota at once; turning a single
  // quota on while quotas are globally off also turns quotas on.
  const toggleMaster = (next) => patch({ enabled: next, memoryEnabled: next, diskEnabled: next });
  const toggleRow = (key, next) => patch({ [key]: next, ...(next && !draft.enabled ? { enabled: true } : {}) });

  const hasUnsavedChanges =
    !!draft &&
    !!saved &&
    (draft.enabled !== saved.enabled ||
      draft.memoryEnabled !== saved.memoryEnabled ||
      draft.memory !== saved.memory ||
      draft.diskEnabled !== saved.diskEnabled ||
      draft.disk !== saved.disk);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await axios.put('/quotas?wait=true', formToConfig(draft, releaseMargin));
      setSaved(draft);
      await loadStatus();
      setError(null);
    } catch (err) {
      setError(readErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const discard = () => setDraft(saved);

  const memoryActive = Boolean(draft?.enabled && draft?.memoryEnabled);
  const diskActive = Boolean(draft?.enabled && draft?.diskEnabled);
  const memoryUsage = summarizeUsage(status, 'resident_memory_percent');
  const diskUsage = summarizeUsage(status, 'disk_usage_percent');
  const memoryStatus = usageStatus(memoryUsage.percent, draft?.memory, releaseMargin, memoryActive);
  const diskStatus = usageStatus(diskUsage.percent, draft?.disk, releaseMargin, diskActive);
  const memoryExceeded = memoryStatus === 'exceeded';
  const diskExceeded = diskStatus === 'exceeded';
  const exceededResources = [memoryExceeded && 'memory', diskExceeded && 'disk'].filter(Boolean);
  const exceededMessage = exceededResources.length
    ? `${exceededResources.join(' and ').replace(/^./, (c) => c.toUpperCase())} usage ${
        exceededResources.length > 1 ? 'have' : 'has'
      } exceeded the configured quota on at least one node.`
    : null;

  return (
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
                  onClick={() => setFlash((f) => ({ nonce: f.nonce + 1, memory: memoryExceeded, disk: diskExceeded }))}
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
              sx={{ color: draft?.enabled ? 'text.secondary' : 'text.primary', fontWeight: 500 }}
            >
              Off
            </Typography>
            <Switch
              checked={Boolean(draft?.enabled)}
              onChange={(event) => toggleMaster(event.target.checked)}
              disabled={loading || saving || !draft}
              inputProps={{ 'aria-label': 'Enable quotas' }}
            />
            <Typography
              component="span"
              variant="body2"
              sx={{ color: draft?.enabled ? 'text.primary' : 'text.secondary', fontWeight: 500 }}
            >
              On
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <Box
            sx={{
              minHeight: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading quotas…
            </Typography>
          </Box>
        ) : !draft ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error || 'Could not load quotas.'}
            </Alert>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setLoading(true);
                loadStatus({ initForm: true })
                  .then(() => setError(null))
                  .catch((err) => setError(readErrorMessage(err)))
                  .finally(() => setLoading(false));
              }}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} role="form">
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

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
                status={memoryStatus}
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
                status={diskStatus}
                peers={diskUsage.peers}
                distributed={diskUsage.distributed}
              />
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
              <Button variant="text" color="inherit" onClick={discard} disabled={!hasUnsavedChanges || saving}>
                Discard
              </Button>
              <Button variant="contained" onClick={save} disabled={!hasUnsavedChanges || saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default QuotasCard;
