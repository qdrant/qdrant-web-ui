import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Collapse, IconButton, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatBytes } from './helpers';

const BAR_AREA_WIDTH = 360;
const BAR_HEIGHT = 14;

const MemoryNode = ({ node, level = 0, maxBytes, mode = 'memory' }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const usage = node.usage || {};
  const ram = usage.ram_bytes || 0;
  const cached = usage.cached_bytes || 0;
  const expected = usage.expected_cache_bytes || 0;
  const disk = usage.disk_bytes || 0;

  const expectedFill = Math.min(cached, expected);
  const extraFill = Math.max(cached - expected, 0);
  const nodeBytes = mode === 'disk' ? disk : ram + Math.max(expected, cached);
  const nodeWidthPct = maxBytes ? (nodeBytes / maxBytes) * 100 : 0;
  const toInnerPct = (bytes) => (nodeBytes ? (bytes / nodeBytes) * 100 : 0);
  const ramInnerPct = toInnerPct(ram);
  const expectedInnerPct = toInnerPct(expected);
  const expectedFillInnerPct = toInnerPct(expectedFill);  
  const extraFillInnerPct = toInnerPct(extraFill);
  const extraStartInnerPct = toInnerPct(ram + expected);

  const ramColor = theme.palette.primary.main;
  const cachedColor = theme.palette.highContrast
    ? theme.palette.success.main
    : theme.palette.info?.main || theme.palette.secondary.main;
  const expectedTrackColor = alpha(cachedColor, 0.18);
  const extraColor = theme.palette.warning.main;
  const diskColor = theme.palette.success.main;

  const footprint = ram + cached;
  const cacheRatio = expected > 0 ? Math.round((cached / expected) * 100) : null;
  const rightLabel = mode === 'disk' ? formatBytes(disk) : formatBytes(footprint);

  const tooltipContent = (
    <Box sx={{ fontFamily: 'Menlo, monospace', fontSize: '0.75rem', lineHeight: 1.6 }}>
      <div>RAM:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {formatBytes(ram)} (heap)</div>
      <div>Cached:&nbsp;&nbsp; {formatBytes(cached)} (page cache)</div>
      <div>Expected: {formatBytes(expected)}</div>
      <div>Disk:&nbsp;&nbsp;&nbsp;&nbsp; {formatBytes(disk)}</div>
    </Box>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 0.75,
          pl: level * 2,
          '&:hover': { bgcolor: theme.palette.action.hover },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden', mr: 2 }}>
          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {hasChildren && (
              <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0.5 }}>
                {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </IconButton>
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{
              ml: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Menlo, monospace',
              fontSize: '0.75rem',
              fontWeight: level === 0 ? 600 : 400,
            }}
          >
            {node.name}
          </Typography>
        </Box>

        <Tooltip title={tooltipContent} placement="left" arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box
              sx={{
                width: BAR_AREA_WIDTH,
                mr: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: BAR_HEIGHT,
              }}
            >
              {nodeBytes > 0 && mode === 'disk' && (
                <Box
                  sx={{
                    height: '100%',
                    width: `${nodeWidthPct}%`,
                    minWidth: 2,
                    borderRadius: 0.5,
                    bgcolor: diskColor,
                  }}
                />
              )}
              {nodeBytes > 0 && mode !== 'disk' && (
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                    width: `${nodeWidthPct}%`,
                    minWidth: 2,
                    borderRadius: 0.5,
                    overflow: 'hidden',
                  }}
                >
                  {ram > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${ramInnerPct}%`,
                        bgcolor: ramColor,
                      }}
                    />
                  )}
                  {expected > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${ramInnerPct}%`,
                        top: 0,
                        height: '100%',
                        width: `${expectedInnerPct}%`,
                        bgcolor: expectedTrackColor,
                      }}
                    />
                  )}
                  {expectedFill > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${ramInnerPct}%`,
                        top: 0,
                        height: '100%',
                        width: `${expectedFillInnerPct}%`,
                        bgcolor: cachedColor,
                      }}
                    />
                  )}
                  {extraFill > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${extraStartInnerPct}%`,
                        top: 0,
                        height: '100%',
                        width: `${extraFillInnerPct}%`,
                        bgcolor: extraColor,
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ minWidth: 90, textAlign: 'right' }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontFamily: 'Menlo, monospace',
                  lineHeight: 1.2,
                  fontWeight: 500,
                }}
              >
                {rightLabel}
              </Typography>
              {mode !== 'disk' && cacheRatio !== null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    fontFamily: 'Menlo, monospace',
                    lineHeight: 1.2,
                    fontSize: '0.65rem',
                  }}
                >
                  cache {cacheRatio}%
                </Typography>
              )}
            </Box>
          </Box>
        </Tooltip>
      </Box>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box>
            {node.children.map((child) => (
              <MemoryNode
                key={child.name}
                node={child}
                level={level + 1}
                maxBytes={maxBytes}
                mode={mode}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

MemoryNode.propTypes = {
  node: PropTypes.shape({
    name: PropTypes.string,
    usage: PropTypes.object,
    children: PropTypes.array,
  }).isRequired,
  level: PropTypes.number,
  maxBytes: PropTypes.number,
  mode: PropTypes.oneOf(['memory', 'disk']),
};

export default MemoryNode;
