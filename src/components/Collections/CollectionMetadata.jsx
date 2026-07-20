import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import { Pencil } from 'lucide-react';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';
import CollectionMetadataDialog from './CollectionMetadataDialog';

const hasMetadata = (metadata) => metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0;

export const CollectionMetadata = ({
  collectionName,
  metadata,
  onMetadataChange,
  forceEditOpen = false,
  onForceEditClose,
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const showMetadata = hasMetadata(metadata);

  const isEditDialogOpen = editOpen || forceEditOpen;

  const handleEditClose = () => {
    setEditOpen(false);
    onForceEditClose?.();
  };

  return (
    <>
      {showMetadata && (
        <Card elevation={0}>
          <CardHeader
            title="Metadata"
            variant="heading"
            action={
              <Box display="flex" alignItems="center" gap={0.5}>
                <CopyButton text={bigIntJSON.stringify(metadata)} />
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
            <JsonViewerCustom
              theme="info"
              value={metadata}
              displayDataTypes={false}
              displayObjectSize={false}
              rootName={false}
              enableClipboard={false}
            />
          </CardContent>
        </Card>
      )}
      <CollectionMetadataDialog
        open={isEditDialogOpen}
        onClose={handleEditClose}
        collectionName={collectionName}
        metadata={metadata}
        onSuccess={onMetadataChange}
      />
    </>
  );
};

CollectionMetadata.propTypes = {
  collectionName: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onMetadataChange: PropTypes.func,
  forceEditOpen: PropTypes.bool,
  onForceEditClose: PropTypes.func,
};

export default memo(CollectionMetadata);
