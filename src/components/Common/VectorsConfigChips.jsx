import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Link, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';

const StyledChip = styled(Chip)(({ theme }) => ({
  height: '1.5rem',
  borderRadius: '0.5rem',
  fontSize: '0.8125rem',
  lineHeight: '1.125rem',
  color: theme.palette.text.secondary,
  backgroundColor: 'transparent',
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiChip-label': {
    padding: '0.1875rem 0.375rem',
  },
}));

const VectorsConfigChips = ({ collectionConfigParams, collectionName, sx = {} }) => {
  const navigate = useNavigate();

  const handleEllipsisClick = () => {
    if (collectionName) {
      navigate(`/collections/${collectionName}`);
    }
  };

  const renderVectorChips = (vectorName, vectorConfig) => {
    const chips = [
      <StyledChip key="name" label={vectorName || 'Default'} />,
      <StyledChip key="size" label={vectorConfig.size} />,
      <StyledChip key="distance" label={vectorConfig.distance} />,
    ];

    // Add model chip if present
    if (vectorConfig.model) {
      chips.push(<StyledChip key="model" label={vectorConfig.model} />);
    }

    return chips;
  };

  const renderSparseVectorChips = (vectorName) => {
    return [<StyledChip key="name" label={vectorName} />, <StyledChip key="type" label="Sparse" />];
  };

  const allChips = [];

  // Handle single vector configuration
  if (collectionConfigParams.vectors.size) {
    allChips.push(
      <Box key="default-vector" sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        {renderVectorChips('Default', collectionConfigParams.vectors)}
      </Box>
    );
  }

  // Handle multiple named vectors
  if (!collectionConfigParams.vectors.size) {
    Object.keys(collectionConfigParams.vectors).forEach((vector) => {
      allChips.push(
        <Box key={vector} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
          {renderVectorChips(vector, collectionConfigParams.vectors[vector])}
        </Box>
      );
    });
  }

  // Handle sparse vectors
  if (collectionConfigParams.sparse_vectors) {
    Object.keys(collectionConfigParams.sparse_vectors).forEach((vector) => {
      allChips.push(
        <Box key={`sparse-${vector}`} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
          {renderSparseVectorChips(vector)}
        </Box>
      );
    });
  }

  // Add ellipsis button if there are more than 3 vector groups
  if (allChips.length > 3) {
    const visibleChips = allChips.slice(0, 3);
    const ellipsisChip = (
      <Box key="ellipsis" sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
        <StyledChip
          label={
            <Box
              sx={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ellipsis size={18} />
            </Box>
          }
          component={Link}
          onClick={handleEllipsisClick}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Box>
    );
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ...sx }}>
        {visibleChips}
        {ellipsisChip}
      </Box>
    );
  }

  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ...sx }}>{allChips}</Box>;
};

VectorsConfigChips.propTypes = {
  collectionConfigParams: PropTypes.object.isRequired,
  collectionName: PropTypes.string,
  sx: PropTypes.object,
};

export default VectorsConfigChips;
