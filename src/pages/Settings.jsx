import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, CardHeader, Grid, Typography, Switch, InputLabel, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MemoryStick, HardDrive, Database } from 'lucide-react';
import StyledSlider from '../components/Common/StyledSlider';
import NumberField from '../components/Common/NumberField';
import { CenteredFrame } from '../components/Common/CenteredFrame';

const labelSx = {
  color: 'text.primary',
  fontWeight: 500,
  fontSize: '0.9375rem',
  lineHeight: 1.3,
};

// A single limit setting laid out as a row: an icon, a label with a short
// description, and a control aligned to the right (stacks on small screens).
function LimitRow({ icon, label, description, htmlFor, disabled, children }) {
  return (
    <Box
      role="group"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 1.5, sm: 3 },
        opacity: disabled ? 0.55 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
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
          <InputLabel htmlFor={htmlFor} sx={labelSx} disabled={disabled}>
            {label}
          </InputLabel>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {description}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          width: { xs: '100%', sm: 280 },
          flexShrink: 0,
          pl: { xs: 6.5, sm: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

LimitRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  htmlFor: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
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
          showSteppers={false}
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

function Settings() {
  const [limitsEnabled, setLimitsEnabled] = useState(false);
  const [memory, setMemory] = useState(80);
  const [disk, setDisk] = useState(80);
  const [maxCollections, setMaxCollections] = useState(null);

  const disabled = !limitsEnabled;

  return (
    <CenteredFrame>
      <Grid container maxWidth={'xl'} width={'100%'} spacing={3}>
        <Grid size={12}>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box display="flex" flexDirection="column" gap={5}>
            <Card elevation={0}>
              <CardHeader
                title="Limits"
                variant="heading"
                sx={{ flexGrow: 1 }}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: limitsEnabled ? 'text.secondary' : 'text.primary', fontWeight: 500 }}
                    >
                      Off
                    </Typography>
                    <Switch
                      checked={limitsEnabled}
                      onChange={(event) => setLimitsEnabled(event.target.checked)}
                      inputProps={{ 'aria-label': 'Enable limits' }}
                    />
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: limitsEnabled ? 'text.primary' : 'text.secondary', fontWeight: 500 }}
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

                  <LimitRow
                    icon={<MemoryStick size="1.25rem" />}
                    label="Memory"
                    description="Share of available RAM this instance may use."
                    htmlFor="memory-limit"
                    disabled={disabled}
                  >
                    <PercentField
                      id="memory-limit"
                      label="Memory"
                      value={memory}
                      onChange={setMemory}
                      disabled={disabled}
                    />
                  </LimitRow>

                  <Divider />

                  <LimitRow
                    icon={<HardDrive size="1.25rem" />}
                    label="Disk space"
                    description="Share of available disk this instance may use."
                    htmlFor="disk-limit"
                    disabled={disabled}
                  >
                    <PercentField
                      id="disk-limit"
                      label="Disk space"
                      value={disk}
                      onChange={setDisk}
                      disabled={disabled}
                    />
                  </LimitRow>

                  <Divider />

                  <LimitRow
                    icon={<Database size="1.25rem" />}
                    label="Collections"
                    description="Maximum number of collections allowed."
                    htmlFor="max-collections"
                    disabled={disabled}
                  >
                    <NumberField
                      id="max-collections"
                      value={maxCollections}
                      onValueChange={setMaxCollections}
                      min={0}
                      step={1}
                      disabled={disabled}
                      placeholder="Unlimited"
                      ariaLabel="Maximum number of collections"
                    />
                  </LimitRow>
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
