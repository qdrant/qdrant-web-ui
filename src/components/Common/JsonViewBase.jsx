import React from 'react';
import PropTypes from 'prop-types';
import RawJsonView from '@uiw/react-json-view';
import { Copy, Check } from 'lucide-react';

const CopiedIcon = RawJsonView.Copied;

const ICON_SIZE = 14;

const renderCopiedIcon = ({ 'data-copied': copied, onClick }) => (
  <span
    onClick={onClick}
    role="button"
    aria-label={copied ? 'Copied' : 'Copy to clipboard'}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      cursor: 'pointer',
      verticalAlign: 'middle',
      color: 'var(--w-rjv-arrow-color, currentColor)',
      paddingLeft: '0.4rem',
    }}
  >
    {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
  </span>
);

const JsonView = ({ enableClipboard = true, shortenTextAfterLength = 50, children, ...otherProps }) => (
  <RawJsonView enableClipboard={enableClipboard} shortenTextAfterLength={shortenTextAfterLength} {...otherProps}>
    {enableClipboard && <CopiedIcon render={renderCopiedIcon} />}
    {children}
  </RawJsonView>
);

JsonView.propTypes = {
  enableClipboard: PropTypes.bool,
  shortenTextAfterLength: PropTypes.number,
  children: PropTypes.node,
};

// Re-export sub-components so consumers never import the raw package directly.
JsonView.Row = RawJsonView.Row;
JsonView.Copied = RawJsonView.Copied;
JsonView.KeyName = RawJsonView.KeyName;

export default JsonView;
