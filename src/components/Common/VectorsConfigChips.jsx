import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link } from 'react-router';

const MAX_VISIBLE_VECTORS = 3;

// On narrower screens the table has no room for names and spec badges side by side, so they are stacked.
const wide = (theme) => theme.breakpoints.up('lg');

const VectorsContainer = styled(Box)({
  display: 'inline-block',
  maxWidth: '100%',
  verticalAlign: 'middle',
  textAlign: 'left',
});

// Narrow screens: each vector is stacked (name above its spec badge).
// Wide screens: two-column grid (name | spec) sized to its content, so the table cell shrinks to fit it.
// Columns are sized by a hidden sizer row holding the longest name and spec of the whole table, so every row
// gets the same columns: names are aligned on the left and specs are centered on a common axis.
const VectorsList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
  [wide(theme)]: {
    display: 'grid',
    gridTemplateColumns: 'max-content max-content',
    columnGap: '0.75rem',
    rowGap: '0.375rem',
    alignItems: 'center',
    justifyItems: 'start',
  },
}));

const VectorItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.125rem',
  maxWidth: '100%',
  [wide(theme)]: {
    display: 'contents',
  },
}));

const VectorName = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  fontWeight: 400,
  color: theme.palette.text.secondary,
  justifySelf: 'stretch',
  minWidth: 0,
  maxWidth: '10rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const SpecBadge = styled(Box, { shouldForwardProp: (prop) => prop !== 'sparse' })(({ theme, sparse }) => {
  const color = sparse ? theme.palette.secondary.main : theme.palette.text.secondary;
  return {
    display: 'inline-flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    columnGap: '0.3125rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '0.75rem',
    backgroundColor: alpha(color, 0.08),
    color,
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    [wide(theme)]: {
      flexWrap: 'nowrap',
      justifySelf: 'center',
    },
    '& .spec-part': {
      display: 'inline-flex',
      alignItems: 'center',
      columnGap: '0.3125rem',
    },
    '& .spec-separator': {
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      backgroundColor: 'currentColor',
      opacity: 0.6,
    },
  };
});

// Invisible copy of the widest name and spec. The text comes from `data-text` via CSS, so it stays out of
// the DOM text (and the accessibility tree).
const sizerSx = (theme) => ({
  display: 'none',
  gridRow: 1,
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  visibility: 'hidden',
  overflow: 'hidden',
  [wide(theme)]: {
    display: 'inline-flex',
  },
  '& [data-text]::before': {
    content: 'attr(data-text)',
  },
});

const MoreLink = styled(Link)(({ theme }) => ({
  gridColumn: '1 / -1',
  fontSize: '0.75rem',
  lineHeight: 1.5,
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.text.primary,
    textDecoration: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '2px',
  },
}));

const DetailsTooltipContent = ({ details }) => (
  <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 1.5, rowGap: 0.25 }}>
    {details.map(([label, value]) => (
      <React.Fragment key={label}>
        <Box component="dt" sx={{ opacity: 0.7 }}>
          {label}
        </Box>
        <Box component="dd" sx={{ m: 0 }}>
          {value}
        </Box>
      </React.Fragment>
    ))}
  </Box>
);

DetailsTooltipContent.propTypes = {
  details: PropTypes.arrayOf(PropTypes.array).isRequired,
};

const getDenseDetails = (config) =>
  [
    ['Type', config.multivector_config ? 'Dense, multivector' : 'Dense'],
    ['Size', config.size],
    ['Distance', config.distance],
    config.datatype && ['Datatype', config.datatype],
    config.multivector_config?.comparator && ['Comparator', config.multivector_config.comparator],
    config.on_disk != null && ['On disk', String(config.on_disk)],
    config.model && ['Model', config.model],
  ].filter(Boolean);

const getSparseDetails = (config = {}) =>
  [
    ['Type', 'Sparse'],
    config.modifier && ['Modifier', config.modifier],
    config.index?.on_disk != null && ['On disk', String(config.index.on_disk)],
  ].filter(Boolean);

// A single unnamed vector is configured directly, named vectors are keyed by name.
const getVisibleVectors = ({ vectors = {}, sparse_vectors: sparseVectors = {} }) => {
  const denseVectors = vectors.size ? [['Default', vectors]] : Object.entries(vectors);
  const allVectors = [
    ...denseVectors.map(([name, config]) => ({ name, config, sparse: false })),
    ...Object.entries(sparseVectors).map(([name, config]) => ({ name, config, sparse: true })),
  ];

  // Show "+N more" only when it hides at least two vectors, otherwise just show them all.
  const visibleCount = allVectors.length > MAX_VISIBLE_VECTORS + 1 ? MAX_VISIBLE_VECTORS : allVectors.length;
  return { visible: allVectors.slice(0, visibleCount), hiddenCount: allVectors.length - visibleCount };
};

const getSpecParts = ({ config, sparse }) =>
  sparse ? ['Sparse'] : [String(config.size), config.distance, config.multivector_config && 'Multi'].filter(Boolean);

// Character count as a width estimate. A separator takes about as much space as two characters.
const specLength = (parts) => parts.join('').length + (parts.length - 1) * 2;

/**
 * Longest vector name and spec among the given configs. Pass the result as `sizing` to every
 * VectorsConfigChips of a table to align their columns.
 * @param {object[]} configParamsList - collection config params
 * @return {{name: string, spec: string[]}}
 */
export const getVectorsSizing = (configParamsList) =>
  configParamsList
    .flatMap((params) => getVisibleVectors(params).visible)
    .reduce(
      (sizing, vector) => {
        const spec = getSpecParts(vector);
        return {
          name: vector.name.length > sizing.name.length ? vector.name : sizing.name,
          spec: specLength(spec) > specLength(sizing.spec) ? spec : sizing.spec,
        };
      },
      { name: '', spec: [] }
    );

// Each separator sticks to the part before it, so a wrapped badge never starts a line with a separator.
const SpecContent = ({ parts, sizer = false }) =>
  parts.map((part, index) => (
    <span key={index} className="spec-part" data-text={sizer ? part : undefined}>
      {!sizer && part}
      {index < parts.length - 1 && <span className="spec-separator" />}
    </span>
  ));

SpecContent.propTypes = {
  parts: PropTypes.arrayOf(PropTypes.string).isRequired,
  sizer: PropTypes.bool,
};

const VectorRow = ({ name, config, sparse, row }) => {
  const details = sparse ? getSparseDetails(config) : getDenseDetails(config);

  return (
    <VectorItem>
      <VectorName component="span" title={name} style={{ gridRow: row, gridColumn: 1 }}>
        {name}
      </VectorName>
      <Tooltip title={<DetailsTooltipContent details={details} />} placement="top" arrow>
        <SpecBadge sparse={sparse} style={{ gridRow: row, gridColumn: 2 }}>
          <SpecContent parts={getSpecParts({ config, sparse })} />
        </SpecBadge>
      </Tooltip>
    </VectorItem>
  );
};

VectorRow.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object,
  sparse: PropTypes.bool,
  row: PropTypes.number.isRequired,
};

const VectorsConfigChips = ({ collectionConfigParams, collectionName, sizing, sx = {} }) => {
  const { visible, hiddenCount } = getVisibleVectors(collectionConfigParams);
  const { name: sizerName, spec: sizerSpec } = sizing || getVectorsSizing([collectionConfigParams]);

  return (
    <VectorsContainer sx={sx}>
      <VectorsList>
        <VectorName component="span" aria-hidden sx={sizerSx} style={{ gridColumn: 1 }}>
          <span data-text={sizerName} />
        </VectorName>
        <SpecBadge aria-hidden sx={sizerSx} style={{ gridColumn: 2 }}>
          <SpecContent parts={sizerSpec} sizer />
        </SpecBadge>
        {visible.map((vector, index) => (
          <VectorRow key={`${vector.sparse ? 'sparse' : 'dense'}-${vector.name}`} {...vector} row={index + 1} />
        ))}
        {hiddenCount > 0 &&
          (collectionName ? (
            <MoreLink to={`/collections/${encodeURIComponent(collectionName)}#info`}>{`+${hiddenCount} more`}</MoreLink>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>
              {`+${hiddenCount} more`}
            </Typography>
          ))}
      </VectorsList>
    </VectorsContainer>
  );
};

VectorsConfigChips.propTypes = {
  collectionConfigParams: PropTypes.object.isRequired,
  collectionName: PropTypes.string,
  sizing: PropTypes.shape({ name: PropTypes.string, spec: PropTypes.arrayOf(PropTypes.string) }),
  sx: PropTypes.object,
};

export default VectorsConfigChips;
