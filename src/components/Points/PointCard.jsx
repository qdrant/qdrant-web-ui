import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, LinearProgress, Box, Typography } from '@mui/material';

import PointImage from './PointImage';
// import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Vectors from './PointVectors';
import { PayloadEditor } from './PayloadEditor';
// import { DataGridList } from './DataGridList';
import { CopyButton } from '../Common/CopyButton';
import { Trash, Pencil } from 'lucide-react';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { bigIntJSON } from '../../common/bigIntJSON';
import { Divider } from '@mui/material';
import JsonViewerCustom from '../Common/JsonViewerCustom';

const PointCard = (props) => {
  const { onConditionChange /* , conditions */ } = props;
  const [point, setPoint] = React.useState(props.point);
  const [openPayloadEditor, setOpenPayloadEditor] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

  const onPayloadEdit = (payload) => {
    setPoint({ ...point, payload: structuredClone(payload) });
  };

  const deletePoint = async () => {
    setLoading(true);
    props.deletePoint(props.collectionName, [point.id]).then(() => {
      setPoint(null);
      setLoading(false);
    });
  };

  if (!point) {
    return null;
  }

  return (
    <>
      <Card
        variant="dual"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          '& .MuiTypography-subtitle2': {
            color: 'text.primary',
            fontFamily: 'Mona Sans, sans-serif',
            fontFeatureSettings: "'ss01' on, 'ss05' on, 'ss06' on, 'liga' off, 'clig' off",
            fontSize: '0.875rem',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 1.5,
          }
        }}
        role="listitem"
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
            }}
          >
            <LinearProgress />
          </Box>
        )}
        <CardHeader
          title={'Point ' + point.id}
          variant="heading"
          aria-label="Point Card Header"
          action={
            <>
              <CopyButton
                text={bigIntJSON.stringify(point)}
                tooltip={'Copy point to clipboard'}
                successMessage={'Point JSON copied to clipboard.'}
              />
              <Tooltip title={'Delete point'} placement={'left'}>
                <IconButton
                  aria-label={'delete point'}
                  onClick={() => {
                    setOpenDeleteDialog(true);
                  }}
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  <Trash size={'1.25rem'} />
                </IconButton>
              </Tooltip>
            </>
          }
        />
        {Object.keys(point.payload).length > 0 && (
          <>
            <CardContent sx={{ padding: '0.5rem 1rem' }}>
              <Box display={'flex'} justifyContent={'space-between'} aria-label="Point Payload">
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" color="text.secondary" marginRight={'24px'}>
                      Payload
                    </Typography>
                    <CopyButton
                      text={bigIntJSON.stringify(point.payload)}
                      tooltip={'Copy payload to clipboard'}
                      successMessage={'Payload JSON copied to clipboard.'}
                    />
                    <IconButton
                      aria-label="add payload"
                      onClick={() => setOpenPayloadEditor(true)}
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <Pencil size={'1.25rem'} />
                    </IconButton>
                  </Box>
                  <JsonViewerCustom
                    value={point.payload}
                    displayDataTypes={false}
                    lineNumbers={true}
                    defaultInspectDepth={2}
                    displayObjectSize={false}
                    rootName={false}
                    enableClipboard={false}
                  />
                </Box>
                {point.payload && <PointImage data={point.payload} />}
              </Box>
            </CardContent>
          </>
        )}
        <Divider />
        <CardContent sx={{ padding: '1rem' }}>
          {point?.vector && <Vectors point={point} onConditionChange={onConditionChange} />}
        </CardContent>
      </Card>
      <PayloadEditor
        collectionName={props.collectionName}
        point={point}
        open={openPayloadEditor}
        onClose={() => {
          setOpenPayloadEditor(false);
        }}
        onSave={onPayloadEdit}
        setLoading={setLoading}
        client={props.client}
        aria-label="Payload Editor"
      />
      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title={'Delete point ' + point.id}
        content={`Are you sure you want to delete point with id ${point.id}?`}
        warning={`This action cannot be undone.`}
        actionName={'Delete'}
        actionHandler={() => deletePoint()}
        aria-label="Delete Point Confirmation Dialog"
      />
    </>
  );
};

PointCard.propTypes = {
  point: PropTypes.object.isRequired,
  onConditionChange: PropTypes.func.isRequired,
  conditions: PropTypes.array.isRequired,
  collectionName: PropTypes.string.isRequired, // use params instead?
  deletePoint: PropTypes.func.isRequired,
  payloadSchema: PropTypes.object.isRequired,
  client: PropTypes.object,
};

export default PointCard;
