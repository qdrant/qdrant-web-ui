import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { RefreshCw } from 'lucide-react';
import { CopyButton } from '../../Common/CopyButton';
import MemoryNode from './MemoryNode';
import { buildMemoryTree, formatBytes, sortTree, memoryFootprint, diskFootprint } from './helpers';

const LegendDot = ({ color, label, variant = 'fill' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    {variant === 'line' ? (
      <Box sx={{ width: 2, height: 14, bgcolor: color }} />
    ) : (
      <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: color }} />
    )}
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

LegendDot.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['fill', 'line']),
};

const SummaryCell = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontFamily: 'Menlo, monospace', fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

SummaryCell.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const MemoryTree = ({ data, onRefresh, isRefreshing }) => {
  const theme = useTheme();
  const [mode, setMode] = useState('memory');
  const rawTree = useMemo(() => buildMemoryTree(data?.result), [data]);
  const tree = useMemo(() => {
    if (!rawTree) return null;
    return sortTree(rawTree, mode === 'disk' ? diskFootprint : memoryFootprint);
  }, [rawTree, mode]);
  const total = data?.result?.total;
  const maxBytes = useMemo(() => {
    const usage = tree?.usage;
    if (!usage) return 0;
    if (mode === 'disk') return usage.disk_bytes || 0;
    const ram = usage.ram_bytes || 0;
    const cached = usage.cached_bytes || 0;
    const expected = usage.expected_cache_bytes || 0;
    return ram + Math.max(cached, expected);
  }, [tree, mode]);

  const ramColor = theme.palette.primary.main;
  const cachedColor = theme.palette.highContrast
    ? theme.palette.success.main
    : theme.palette.info?.main || theme.palette.secondary.main;
  const expectedTrackColor = alpha(cachedColor, 0.18);
  const extraColor = theme.palette.warning.main;
  const diskColor = theme.palette.success.main;

  return (
    <Card elevation={0}>
      <CardHeader
        title={'Memory Usage'}
        variant="heading"
        sx={{ flexGrow: 1 }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              size="small"
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              aria-label="memory view mode"
            >
              <ToggleButton value="memory" sx={{ px: 1.5, py: 0.25, textTransform: 'none' }}>
                RAM
              </ToggleButton>
              <ToggleButton value="disk" sx={{ px: 1.5, py: 0.25, textTransform: 'none' }}>
                Disk
              </ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={onRefresh} disabled={isRefreshing} size="small">
                  <RefreshCw size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <CopyButton text={JSON.stringify(data)} />
          </Box>
        }
      />
      <CardContent>
        {total && (
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
              px: 2,
              py: 2,
              mb: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.text.primary, 0.03),
            }}
          >
            <SummaryCell label="Disk" value={formatBytes(total.disk_bytes)} />
            <SummaryCell label="RAM" value={formatBytes(total.ram_bytes)} />
            <SummaryCell label="Cached" value={formatBytes(total.cached_bytes)} />
            <SummaryCell label="Expected cache" value={formatBytes(total.expected_cache_bytes)} />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap', px: 1, mb: 1.5 }}>
          {mode === 'memory' ? (
            <>
              <LegendDot color={ramColor} label="RAM (non-evictable heap)" />
              <LegendDot color={expectedTrackColor} label="Expected cache (slot)" />
              <LegendDot color={cachedColor} label="Cached (within expected)" />
              <LegendDot color={extraColor} label="Extra cache (beyond expected)" />
            </>
          ) : (
            <LegendDot color={diskColor} label="Disk (file size)" />
          )}
        </Box>

        <Box sx={{ overflow: 'auto', borderRadius: 1, pt: 1, pr: 0.5 }}>
          {!data ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Loading memory info...
            </Typography>
          ) : tree ? (
            <MemoryNode node={tree} maxBytes={maxBytes} mode={mode} />
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No memory info available
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

MemoryTree.propTypes = {
  data: PropTypes.object,
  onRefresh: PropTypes.func,
  isRefreshing: PropTypes.bool,
};

export default MemoryTree;
