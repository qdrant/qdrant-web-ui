import React, { useState } from 'react';
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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MemoryStick, HardDrive, Database } from 'lucide-react';
import StyledSlider from '../components/Common/StyledSlider';
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

// A single quota setting laid out as a row: an icon, a label with a short
// description, its own enable/disable switch, and a control. On desktop the
// switch sits at the far right; on small screens it moves up beside the label
// and the control drops to its own line. When the row is off, its content dims
// but the switch stays fully interactive.
function QuotaRow({ icon, label, description, htmlFor, enabled, onToggle, dimmed, children }) {
  return (
    <Box
      role="group"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 1.5, sm: 3 },
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
          width: { xs: '100%', sm: 280 },
          flexShrink: 0,
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
  children: PropTypes.node.isRequired,
};

// Percentage control: a slider paired with a compact numeric field, kept in
// sync. Values are 0–100; `null` (empty field) reads as 0 on the slider.
function PercentField({ id, label, value, onChange, disabled }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <StyledSlider
        value={typeof value === 'number' ? value : 0}
        onChange={(_, next) => onChange(next)}
        disabled={disabled}
        min={0}
        max={100}
        aria-label={`${label} percentage`}
        sx={{ flex: 1 }}
      />
      <Box sx={{ width: 96, flexShrink: 0 }}>
        <NumberField
          id={id}
          value={value}
          onValueChange={onChange}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          suffix="%"
          ariaLabel={`${label} percentage value`}
        />
      </Box>
    </Box>
  );
}

PercentField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
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

function Settings() {
  // The whole card is a draft: switches and values change freely and are only
  // committed to `saved` when the user clicks Save. Comparing the two tells us
  // whether there are unsaved changes.
  const [draft, setDraft] = useState(INITIAL_QUOTAS);
  const [saved, setSaved] = useState(INITIAL_QUOTAS);

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
                title="Quotas"
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
                  >
                    <PercentField
                      id="memory-quota"
                      label="Memory"
                      value={draft.memory}
                      onChange={(value) => patch({ memory: value })}
                      disabled={!memoryActive}
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
                  >
                    <PercentField
                      id="disk-quota"
                      label="Disk space"
                      value={draft.disk}
                      onChange={(value) => patch({ disk: value })}
                      disabled={!diskActive}
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
