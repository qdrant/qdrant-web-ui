import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, LinearProgress, Collapse, IconButton } from '@mui/material';
import { useTheme, alpha, keyframes } from '@mui/material/styles';
import { ChevronDown, ChevronRight } from 'lucide-react';
import yellow from '../../../../theme/colors/yellow';

// Define a smooth, lightweight keyframe animation for the initial render
const growWidth = keyframes`
  from {
    width: 0;
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
`;

const OptimizationNode = ({ node, level = 0, totalDuration, maxTime }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Use pre-calculated duration
  const duration = node.duration || 0;
  const isFinished = !!node.finished_at;

  // Calculate visual width percentage based on duration
  // Ensure at least a small width for visibility if duration is tiny but > 0
  const widthPercent = totalDuration ? Math.max((duration / totalDuration) * 100, 0.5) : 0;

  // For the progress bar itself (the fill inside the allocated width):
  // If finished, it's 100% filled.
  // If not finished, we estimate progress based on done/total if available.
  // If no done/total, we keep it solid (100%) as we don't know how far along it is.
  let fillPercent = 100;
  if (!isFinished && node.total > 0 && node.done !== undefined) {
    fillPercent = (node.done / node.total) * 100;
  }

  // Progress percentage text
  let progressText = '';

  // Prioritize showing done/total if available and not finished
  if (!node.started_at) {
    progressText = 'pending';
  } else if (duration > 0) {
    // Show duration for everything else (even if not finished, but started)
    if (duration < 1000) {
      progressText = `${Math.round(duration)}ms`;
    } else if (duration < 60000) {
      progressText = `${(duration / 1000).toFixed(2)}s`;
    } else {
      progressText = `${(duration / 60000).toFixed(2)}m`;
    }
  }

  const handleToggle = () => {
    setOpen(!open);
  };

  const barColor = isFinished ? theme.palette.success.main : yellow[700];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 0.5,
          pl: level * 2,
          '&:hover': {
            bgcolor: theme.palette.action.hover,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden', mr: 2 }}>
          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {hasChildren && (
              <IconButton size="small" onClick={handleToggle} sx={{ p: 0.5 }}>
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
            }}
          >
            {node.name ||
              (level === 0 ? (
                'Optimizations'
              ) : (
                <Typography component="span" variant="body2" fontStyle="italic">
                  default
                </Typography>
              ))}
          </Typography>
        </Box>

        {(duration > 0 || progressText) && (!hasChildren || !open) && (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '300px', flexShrink: 0 }}>
            {/* Bar container */}
            <Box
              sx={{
                width: '100%',
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  bgcolor: 'transparent',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {progressText !== 'pending' && (
                  <LinearProgress
                    variant="determinate"
                    value={fillPercent} // Fill based on done/total or 100%
                    sx={{
                      width: `${widthPercent}%`,
                      height: 12,
                      borderRadius: 2,
                      bgcolor: alpha(barColor, 0.2), // Track is lighter version of bar color
                      // Use a keyframe animation for the container width on mount
                      animation: `${growWidth} 0.5s ease-out`,
                      // Remove transition on width to prevent jank on re-renders,
                      // or use it very carefully. Here, we prefer keyframe for initial render.
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: barColor,
                        borderRadius: 2,
                        transition: 'transform 0.3s linear', // Smoother, faster transition for fill updates
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ minWidth: 60, textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                {progressText}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box>
            {node.children.map((child, index) => (
              <OptimizationNode
                key={`${child.name}-${child.started_at}-${index}`}
                node={child}
                level={level + 1}
                totalDuration={totalDuration}
                maxTime={maxTime}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

OptimizationNode.propTypes = {
  node: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
    finished_at: PropTypes.string,
    started_at: PropTypes.string,
    duration_sec: PropTypes.number,
    done: PropTypes.number,
    total: PropTypes.number,
    duration: PropTypes.number,
  }).isRequired,
  level: PropTypes.number,
  totalDuration: PropTypes.number,
  maxTime: PropTypes.number,
};

export default OptimizationNode;
