import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, CardHeader, LinearProgress, Box } from '@mui/material';

import PointImage from './PointImage';
import { alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Edit from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Vectors from './PointVectors';
import { PayloadEditor } from './PayloadEditor';
import { DataGridList } from './DataGridList';
import { CopyButton } from '../Common/CopyButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { bigIntJSON } from '../../common/bigIntJSON';

const PointCard = (props) => {
  const theme = useTheme();
  const { onConditionChange, conditions } = props;
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
        }}
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
          action={
            <>
              {Object.keys(point.payload).length === 0 && (
                <Tooltip title="Add Payload" placement="left">
                  <IconButton aria-label="add payload" onClick={() => setOpenPayloadEditor(true)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
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
                >
                  <DeleteIcon color={'error'} />
                </IconButton>
              </Tooltip>
            </>
          }
        />
        {Object.keys(point.payload).length > 0 && (
          <>
            <CardHeader
              subheader={'Payload:'}
              sx={{
                flexGrow: 1,
                background: alpha(theme.palette.primary.main, 0.05),
              }}
              action={
                <>
                  <Tooltip title="Edit Payload" placement="left">
                    <IconButton aria-label="edit point payload" onClick={() => setOpenPayloadEditor(true)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <CopyButton
                    text={bigIntJSON.stringify(point.payload)}
                    tooltip={'Copy payload to clipboard'}
                    successMessage={'Payload JSON copied to clipboard.'}
                  />
                </>
              }
            />
            <CardContent>
              <Grid container display={'flex'}>
                <Grid item xs my={1}>
                  <DataGridList
                    data={point.payload}
                    onConditionChange={onConditionChange}
                    conditions={conditions}
                    payloadSchema={props.payloadSchema}
                  />
                </Grid>
                {point.payload && <PointImage data={point.payload} sx={{ ml: 2 }} />}
              </Grid>
            </CardContent>
          </>
        )}
        <CardHeader
          subheader={'Vectors:'}
          sx={{
            flexGrow: 1,
            background: alpha(theme.palette.primary.main, 0.05),
          }}
        />
        <CardContent>{point?.vector && <Vectors point={point} onConditionChange={onConditionChange} />}</CardContent>
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
      />
      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        title={'Delete point ' + point.id}
        content={`Are you sure you want to delete point with id ${point.id}?`}
        warning={`This action cannot be undone.`}
        actionName={'Delete'}
        actionHandler={() => deletePoint()}
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
};

export default PointCard;
