import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Grid, CardHeader, LinearProgress, Box } from '@mui/material';

import PointImage from './PointImage';
// import { useTheme } from '@mui/material/styles';
import Edit from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Vectors from './PointVectors';
import { PayloadEditor } from './PayloadEditor';
// import { DataGridList } from './DataGridList';
import { CopyButton } from '../Common/CopyButton';
import { DeleteOutline } from '@mui/icons-material';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { bigIntJSON } from '../../common/bigIntJSON';
import { Divider } from '@mui/material';
import JsonViewerCustom from '../Common/JsonViewerCustom';

const PointCard = (props) => {
  // const theme = useTheme();
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
          variant="heading"
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
                  <DeleteOutline />
                </IconButton>
              </Tooltip>
            </>
          }
        />
        {Object.keys(point.payload).length > 0 && (
          <>
            <CardContent>
              <Grid container display={'flex'}>
                <Grid my={1} size="grow">
                  <JsonViewerCustom
                    value={point.payload}
                    displayDataTypes={false}
                    lineNumbers={true}
                    defaultInspectDepth={2}
                    rootName={false}
                  />
                </Grid>
                {point.payload && <PointImage data={point.payload} sx={{ ml: 2 }} />}
              </Grid>
            </CardContent>
          </>
        )}
        <Divider />
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
        client={props.client}
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
  client: PropTypes.object,
};

export default PointCard;
