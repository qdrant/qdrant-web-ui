/* eslint-disable */
import React, { forwardRef } from 'react';
import { styled, alpha, lighten, useTheme } from '@mui/material/styles';
import { ArcherElement } from 'react-archer';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import Tooltip, {tooltipClasses} from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';

const StyledShard = styled('div')(({ theme, state, sx }) => {
  let color;
  switch (state) {
    case 'active':
      color ='#26A69A';
      break;
    case 'dead':
      color = '#EC407A';
      break;
    case 'empty':
      if (theme.palette.mode === 'dark') {
        color = '#262B3A';
      } else {
        color = '#E2E7F5';
      }
      break;
    default:
      color = '#FFA726';
  }

  let styles = {
    borderRadius: '2px', // todo: take from theme
    backgroundColor: color,
    // height: 'clamp(32, 100, 100%)',
    height: '80px',
    width: 'auto',
    minWidth: '20px',
    position: 'relative',
    // typography
    '& .MuiTypography-root': {
      color: lighten(color, 0.8),
      position: 'relative',
      margin: '0 auto',
      zIndex: 1,
    },
    ... sx
  }

  return styles;
});

const StyledTooltip = styled(({ className, theme, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#0B0F19' : '#FCFDFF', // todo: take from theme
    color: theme.palette.mode === 'dark' ? '#FCFDFF' : '#0B0F19', // todo: take from theme
    boxShadow: theme.shadows[5],
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.mode === 'dark' ? '#0B0F19' : '#FCFDFF', // todo: take from theme
  },
}));

const Slot = forwardRef(({ id, peerId: currentPeerId, shard, transfer, peersNumber }, ref) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  React.useEffect(() => {
    console.log('peersNumber', peersNumber);
  }, [peersNumber]);

  const relations = [];
  if (transfer?.transfer) {
    let targetAnchorDirection;
    let sourceAnchorDirection;

    if (transfer.transfer.to > transfer.transfer.from) {
      targetAnchorDirection = 'left';
      sourceAnchorDirection = 'right';
    } else {
      targetAnchorDirection = 'right';
      sourceAnchorDirection = 'left';
    }

    relations.push({
      targetId: `${transfer.transfer.to}-${transfer.transfer.to_shard_id ||
      transfer.transfer.shard_id}`,
      targetAnchor: targetAnchorDirection,
      // targetAnchor: 'middle',
      sourceAnchor: sourceAnchorDirection,
      // sourceAnchor: 'middle',
      style: {
        strokeWidth: '2',
        endMarker: true,
        endShape: {
          arrow: {
            arrowLength: 2,
          }
        }
      },
    });
  }
  console.log('archer id 2', `${currentPeerId}-${id}`);
  return (
    <ArcherElement id={`${currentPeerId}-${id}`} relations={relations}>
      <StyledTooltip
        arrow
               title={
                 <React.Fragment>
<Typography variant='caption'><b>Peer Id:</b> {currentPeerId}</Typography><br />
                   {/* todo: abstract one line of tooltip */}
                    {shard ? (
                      <>
                        <Typography variant='caption'><b>Shard Id:</b> {shard.shard_id}</Typography><br />
<Typography variant='caption'><b>Shard Key:</b> {shard.shard_key ? shard.shard_key : 'N/A'}</Typography><br />
                        <Typography variant='caption'><b>Shard State:</b> {shard.state}</Typography><br/>
                      </>
                    ) : (

                      <Typography variant='caption'><b>Shard State:</b> Empty</Typography>
                    )}
                 </React.Fragment>
               }
      >
      <div style={{position: 'static'}} ref={ref} title={currentPeerId}>
      <StyledShard state={shard ? shard.state.toLowerCase() : 'empty'}
                   sx={{
                     minWidth: peersNumber >= 40 ? '22px' : 'auto',
                     maxWidth: peersNumber >= 40 ? '22px' : 'unset',
                     aspectRatio: peersNumber >= 40 ? '11/16' : 'unset',
                     height: peersNumber >= 40 ? '2rem' : '80px',
                   }}
      >
        {shard && (
         <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
           {`${(!matches && peersNumber <= 20 ? 'Shard' : '')} ${shard.shard_id}`}
         </Typography>
        )}
           {shard?.shard_key && (

             <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
             {(peersNumber <= 5 ? `${shard.shard_key}` : '')}
             </Typography>
            )}
      </StyledShard>
      </div>
      </StyledTooltip>
    </ArcherElement>
  );
});

Slot.displayName = 'Slot';

Slot.propTypes = {
  id: PropTypes.number.isRequired,
  peerId: PropTypes.number.isRequired,
  shard: PropTypes.shape({
    shard_id: PropTypes.number.isRequired,
    state: PropTypes.string,
    points_count: PropTypes.number,
    peer_id: PropTypes.number.isRequired,
  }),
  transfer: PropTypes.shape({
    transfer: PropTypes.shape({
      shard_id: PropTypes.number,
      from: PropTypes.number,
      to: PropTypes.number,
      to_shard_id: PropTypes.number,
    }),
  }),
  peersNumber: PropTypes.number,
};

export default Slot;
