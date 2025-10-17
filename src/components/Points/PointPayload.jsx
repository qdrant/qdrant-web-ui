import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { CopyButton } from '../Common/CopyButton';
import { Pencil } from 'lucide-react';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { bigIntJSON } from '../../common/bigIntJSON';
import PointImage from './PointImage';
import { PayloadEditor } from './PayloadEditor';

const PointPayload = ({ point, showImage = true, onPayloadEdit, setLoading, buttonsToShow = ['copy', 'edit'] }) => {
  const [openPayloadEditor, setOpenPayloadEditor] = useState(false);

  if (!point || !point.payload || Object.keys(point.payload).length === 0) {
    return null;
  }

  return (
    <>
      <Box display={'flex'} justifyContent={'space-between'} aria-label="Point Payload">
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2" marginRight={'24px'}>
              Payload
            </Typography>
            {buttonsToShow.includes('copy') && (
              <CopyButton
                text={bigIntJSON.stringify(point.payload)}
                tooltip={'Copy payload to clipboard'}
                successMessage={'Payload JSON copied to clipboard.'}
              />
            )}
            {buttonsToShow.includes('edit') && (
              <Tooltip title={'Edit payload'} placement={'left'}>
                <IconButton
                  aria-label="add payload"
                  onClick={() => setOpenPayloadEditor(true)}
                  sx={{ color: 'text.primary' }}
                >
                  <Pencil size={'1.25rem'} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <JsonViewerCustom
            value={point.payload}
            displayDataTypes={false}
            defaultInspectDepth={2}
            displayObjectSize={false}
            rootName={false}
            enableClipboard={false}
          />
        </Box>
        {showImage && point.payload && <PointImage data={point.payload} />}
      </Box>
      <PayloadEditor
        point={point}
        open={openPayloadEditor}
        onClose={() => setOpenPayloadEditor(false)}
        onSave={onPayloadEdit}
        setLoading={setLoading || (() => {})}
        aria-label="Payload Editor"
      />
    </>
  );
};

PointPayload.propTypes = {
  point: PropTypes.object.isRequired,
  showImage: PropTypes.bool,
  onPayloadEdit: PropTypes.func.isRequired,
  setLoading: PropTypes.func,
  buttonsToShow: PropTypes.array,
};

export default PointPayload;
