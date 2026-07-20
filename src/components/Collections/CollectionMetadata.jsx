import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';

const hasMetadata = (metadata) => metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0;

export const CollectionMetadata = ({ metadata }) => {
  const showMetadata = hasMetadata(metadata);

  return (
    <Card elevation={0}>
      <CardHeader
        title="Metadata"
        variant="heading"
        action={showMetadata ? <CopyButton text={bigIntJSON.stringify(metadata)} /> : null}
      />
      <CardContent>
        {showMetadata ? (
          <JsonViewerCustom
            theme="info"
            value={metadata}
            displayDataTypes={false}
            displayObjectSize={false}
            rootName={false}
            enableClipboard={false}
          />
        ) : (
          <Typography variant="subtitle1" color="text.secondary">
            No metadata
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

CollectionMetadata.propTypes = {
  metadata: PropTypes.object,
};

export default memo(CollectionMetadata);
