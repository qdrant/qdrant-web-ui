import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { CopyButton } from '../Common/CopyButton';
import { Pencil } from 'lucide-react';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { bigIntJSON } from '../../common/bigIntJSON';
import PointImage from './PointImage';
import { PayloadEditor } from './PayloadEditor';
import PayloadIndexDialog from './PayloadIndexDialog';
import {
  makePayloadIndexValueTypes,
  PayloadIndexColorspaceProvider,
  IndexActionProvider,
  HoverFieldProvider,
} from './makePayloadIndexValueTypes';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';

const PointPayload = ({
  point,
  showImage = true,
  onPayloadEdit,
  setLoading,
  buttonsToShow = ['copy', 'edit'],
  collectionName,
  payloadSchema,
  onPayloadSchemaRefresh,
}) => {
  const [openPayloadEditor, setOpenPayloadEditor] = useState(false);
  const [indexDialogOpen, setIndexDialogOpen] = useState(false);
  const [indexField, setIndexField] = useState(null); // { name, value } of the field to index
  // Tracks which payload field is currently "row-hovered" (dot-joined path or null).
  // Mirrors json-viewer's own hoverPath lifetime: persists in the between-row gutter,
  // clears only when the cursor leaves the json viewer area entirely.
  const [activeField, setActiveField] = useState(null);

  const handleViewerMouseOver = useCallback((e) => {
    // data-testid on each .data-key-pair row is "data-key-pair" + path.join('.').
    // json-viewer sets its own hover (the copy button) via per-row mouseenter, which
    // does not re-fire when the cursor moves from a leaf row out into an enclosing
    // parent row or the gutter. Emulate that: only update activeField when the cursor
    // crosses into a row that didn't already contain it.
    const row = e.target.closest?.('[data-testid^="data-key-pair"]');
    if (!row || (e.relatedTarget instanceof Node && row.contains(e.relatedTarget))) return;
    setActiveField(row.getAttribute('data-testid').slice('data-key-pair'.length));
  }, []);

  const handleViewerMouseLeave = useCallback(() => setActiveField(null), []);

  const { theme: colorspace } = useJsonViewerTheme('qdrant-custom');
  const colorspaceSubset = useMemo(
    () => ({
      base02: colorspace.base02,
      base08: colorspace.base08,
      base09: colorspace.base09,
      base0B: colorspace.base0B,
      base0D: colorspace.base0D,
      base0E: colorspace.base0E,
      base0F: colorspace.base0F,
    }),
    [colorspace]
  );

  const indexAction = useMemo(
    () => ({
      open: (fieldName, fieldValue) => {
        setIndexField({ name: fieldName, value: fieldValue });
        setIndexDialogOpen(true);
      },
      isIndexed: (fieldName) => !!(payloadSchema && fieldName in payloadSchema),
    }),
    [payloadSchema]
  );

  const valueTypes = useMemo(() => makePayloadIndexValueTypes(), []);

  if (!point || !point.payload || Object.keys(point.payload).length === 0) {
    return null;
  }

  const showIndexButton = collectionName && buttonsToShow.includes('index');

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
          <PayloadIndexColorspaceProvider value={colorspaceSubset}>
            <IndexActionProvider value={showIndexButton ? indexAction : null}>
              <HoverFieldProvider value={activeField}>
                <Box
                  onMouseOver={showIndexButton ? handleViewerMouseOver : undefined}
                  onMouseLeave={showIndexButton ? handleViewerMouseLeave : undefined}
                >
                  <JsonViewerCustom
                    value={point.payload}
                    displayDataTypes={false}
                    defaultInspectDepth={2}
                    displayObjectSize={false}
                    rootName={false}
                    enableClipboard={true}
                    valueTypes={showIndexButton ? valueTypes : undefined}
                  />
                </Box>
              </HoverFieldProvider>
            </IndexActionProvider>
          </PayloadIndexColorspaceProvider>
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
      {showIndexButton && (
        <PayloadIndexDialog
          open={indexDialogOpen}
          onClose={() => setIndexDialogOpen(false)}
          collectionName={collectionName}
          fieldName={indexField?.name}
          fieldValue={indexField?.value}
          payloadSchema={payloadSchema}
          onSuccess={onPayloadSchemaRefresh}
        />
      )}
    </>
  );
};

PointPayload.propTypes = {
  point: PropTypes.object.isRequired,
  showImage: PropTypes.bool,
  onPayloadEdit: PropTypes.func.isRequired,
  setLoading: PropTypes.func,
  buttonsToShow: PropTypes.array,
  collectionName: PropTypes.string,
  payloadSchema: PropTypes.object,
  onPayloadSchemaRefresh: PropTypes.func,
};

export default PointPayload;
