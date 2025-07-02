/* eslint-disable */
import React, { forwardRef } from 'react';
import { styled, alpha, lighten } from '@mui/material/styles';
import { ArcherElement } from 'react-archer';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

const StyledShard = styled('div')(({ theme, state, isInTransfer }) => {
  let colors;
  switch (state) {
    case 'active':
      if (theme.palette.mode === 'dark') {
        colors = ['#038585', '#004f4f', '#002020'];
      } else {
        colors = ['#038585', '#c0f0f0', '#77e5e5'];
      }
      break;
    case 'dead':
      if (theme.palette.mode === 'dark') {
        colors = ['#fe897f', '#93000d', '#410002'];
      } else {
        colors = ['#93000d', '#fe897f', '#ffdad6'];
      }
      break;
    case 'empty':
      if (theme.palette.mode === 'dark') {
        colors = ['#50555a', '#2a2d30', '#0f1011'];
      } else {
        colors = ['#717c99', '#f0f3fa', '#d4d9e6'];
      }
      break;
    default:
      if (theme.palette.mode === 'dark') {
        colors = ['#da762d', '#733501', '#311300'];
      } else {
        colors = ['#735101', '#fff0c7', '#ffe189'];
      }
  }

  let styles = {
    padding: theme.spacing(1),
    border: `1px solid ${colors[2]}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: colors[1],
    backgroundImage: `linear-gradient(${alpha(colors[1], 0.1)} 0%, ${colors[1]} 30%)`,
    height: '100px',
    position: 'relative',
    // typography
    '& .MuiTypography-root': {
      color: theme.palette.mode === 'dark' ? lighten(colors[0], 0.7) : colors[0],
      position: 'relative',
      zIndex: 1,
    }
  }

  if (isInTransfer) {
    styles = {
      ...styles,
      '&:after': {
        // shine animation
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: theme.palette.mode === 'dark' ?
          // todo: update this to follow light styles
          `linear-gradient(
          90deg,
          transparent 0%, 
          transparent 20%, 
          ${lighten(colors[1], 0.2)} 50%,
          white 64%,
          ${lighten(colors[1], 0.2)} 66%,
          transparent 80%,
          transparent 100%
          )`
          :
          `linear-gradient(
          90deg,
          transparent 0%,
          transparent 50%,
          rgba(255, 255, 255, 0.5) 59%,
          transparent 70%,
          transparent 100%
          )`,

        // todo: in the yellow slot gradient fades to yellow as if it fills the slot

        backgroundSize: '200% 200%',
        backgroundPosition: '0% 0%',
        animation: state === 'active' ? 'shine 2s linear infinite' : 'shine-follow 2s linear infinite',
        // transitionOrigin: state === 'active' ? 'left' : 'right',
      }
    }
  }

  return styles;
});

const Slot = forwardRef(({ id, peerId: currentPeerId, shard, transfer }, ref) => {
  console.log('shard', shard?.state, shard);
  console.log('transfer', transfer?.transfer);
  const [openLabel, setOpenLabel] = React.useState(false);

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
      targetId: `${transfer.transfer.to}-${transfer.transfer.to_shard_id || transfer.transfer.shard_id}`,
      targetAnchor: targetAnchorDirection,
      // targetAnchor: 'middle',
      sourceAnchor: sourceAnchorDirection,
      // sourceAnchor: 'middle',
      style: {
        strokeDasharray: '5,5',
        strokeWidth: '2',
        // no arrow on the end
        endMarker: true,
        endShape: {
          arrow: {
            arrowLength: 4,
          }
        }
      },
      domAttributes: {
        // change the label's display to block to show the label
        // on hover the arrow
        onMouseOver: () => {
          // console.log(e.target.ownerSVGElement.querySelector('.arrow-label'));
          // const label = e.target.ownerSVGElement.querySelector('.arrow-label');
          // if (label) {
          //   label.style.display = 'block';
          // }
          setOpenLabel(true);
        },
        onClick: () => {
          setOpenLabel(!openLabel);
        }
        // onMouseLeave: (e) => {
          // const label = e.target.ownerSVGElement.querySelector('.arrow-label');
          // if (label) {
          //   label.style.display = 'none';
          // }
          // setOpenLabel(false)
        // }
      },
      // todo: why would we need this?
      label: <Box
        sx={{
        display: openLabel ? 'block' : 'none',
        width: 'max-content',
        height: '60px',
        position: 'absolute',
        top: '-70px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(18, 18, 18, 0.7)',
        padding: '2px 4px',
        borderRadius: '4px',
        color: '#ffffff',
      }}
        onClick={() => {
          setOpenLabel(false);
        }}
      >
        <Typography variant="caption" className="arrow-label">
          {`Transfer from ${transfer?.transfer.from} to ${transfer?.transfer.to}`}
        </Typography>
      </Box>
    });
  }
  console.log('archer id 2', `${currentPeerId}-${id}`);
  return (
    <ArcherElement id={`${currentPeerId}-${id}`} relations={relations}>
      <div style={{position: 'static'}} ref={ref}>
      <StyledShard state={shard ? shard.state.toLowerCase() : 'empty'}
                   isInTransfer={(transfer?.transfer && transfer.transfer.from === currentPeerId) || shard?.state === 'Partial'}
      >
         <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {shard ? `Shard ${shard.shard_id}` : `Slot ${id}`}
         </Typography>
      </StyledShard>
      </div>
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
};

export default Slot;
