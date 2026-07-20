import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, CardHeader, IconButton, Tooltip, Typography } from '@mui/material';
import { Pencil } from 'lucide-react';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';
import CollectionMetadataDialog from './CollectionMetadataDialog';

const hasMetadata = (metadata) => metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0;

export const CollectionMetadata = ({ collectionName, metadata, onMetadataChange }) => {
  const [editOpen, setEditOpen] = useState(false);
  const showMetadata = hasMetadata(metadata);

  return (
    <Card elevation={0}>
      <CardHeader
        title="Metadata"
        variant="heading"
        action={
          <Box display="flex" alignItems="center" gap={0.5}>
            {showMetadata && <CopyButton text={bigIntJSON.stringify(metadata)} />}
            <Tooltip title="Edit metadata">
              <IconButton
                aria-label="Edit metadata"
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ color: 'text.primary' }}
              >
                <Pencil size="1.25rem" />
              </IconButton>
            </Tooltip>
          </Box>
        }
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
      <CollectionMetadataDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collectionName={collectionName}
        metadata={metadata}
        onSuccess={onMetadataChange}
      />
    </Card>
  );
};

CollectionMetadata.propTypes = {
  collectionName: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onMetadataChange: PropTypes.func,
};

export default memo(CollectionMetadata);
