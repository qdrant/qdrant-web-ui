import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardHeader,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Pencil, Trash } from 'lucide-react';
import { useClient } from '../../context/client-context';
import DeletePayloadIndexDialog from '../Common/DeletePayloadIndexDialog';
import PayloadIndexDialog from '../Points/PayloadIndexDialog';
import { extractPayloadLeafFields } from '../../lib/payload-index-helpers';

const HeaderCell = ({ children, ...props }) => (
  <TableCell {...props}>
    <Typography variant="subtitle1" fontWeight={600}>
      {children}
    </Typography>
  </TableCell>
);
HeaderCell.propTypes = { children: PropTypes.node };

const PayloadIndexesCard = ({
  collectionName,
  payloadSchema,
  onSchemaChange,
  forceCreateOpen = false,
  onForceCreateClose,
  ...other
}) => {
  const { client: qdrantClient } = useClient();
  const [fieldToDelete, setFieldToDelete] = useState(null);
  // null = closed, { fieldName: null } = create with field picker, { fieldName } = edit
  const [dialogState, setDialogState] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);

  const fields = Object.keys(payloadSchema || {});

  const openCreateDialog = useCallback(async () => {
    let leafFields = [];
    try {
      const result = await qdrantClient.scroll(collectionName, { limit: 1, with_payload: true, with_vector: false });
      leafFields = extractPayloadLeafFields(result?.points?.[0]?.payload);
    } catch {
      // No options is fine — the field name can still be typed manually.
    }
    setAvailableFields(leafFields);
    setDialogState({ fieldName: null });
  }, [qdrantClient, collectionName]);

  useEffect(() => {
    if (forceCreateOpen) {
      openCreateDialog();
    }
  }, [forceCreateOpen, openCreateDialog]);

  const handleDialogClose = () => {
    setDialogState(null);
    onForceCreateClose?.();
  };

  return (
    <>
      {fields.length > 0 && (
        <Card elevation={0} {...other}>
          <CardHeader
            title={'Payload Indexes'}
            variant="heading"
            action={
              <Button variant="contained" size="small" sx={{ py: 0.75, mb: 0.2 }} onClick={openCreateDialog}>
                Create Index
              </Button>
            }
          />
          <Table>
            <TableHead>
              <TableRow>
                <HeaderCell>Field</HeaderCell>
                <HeaderCell>Type</HeaderCell>
                <HeaderCell>Points</HeaderCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                '& tr:last-of-type td': {
                  borderBottom: 'none',
                },
              }}
            >
              {fields.map((fieldName) => {
                const info = payloadSchema[fieldName];
                return (
                  <TableRow key={fieldName}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" sx={{ overflowWrap: 'anywhere' }}>
                        {fieldName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          info?.params ? (
                            <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                              {JSON.stringify(info.params, null, 2)}
                            </pre>
                          ) : (
                            ''
                          )
                        }
                        placement="top"
                      >
                        <Chip label={info?.data_type} size="small" variant="outlined" />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{info?.points ?? '—'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={'Edit index'} placement={'left'}>
                        <IconButton
                          aria-label={`Edit index for ${fieldName}`}
                          onClick={() => setDialogState({ fieldName })}
                          sx={{ color: 'text.primary' }}
                        >
                          <Pencil size={'1.25rem'} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={'Delete index'} placement={'left'}>
                        <IconButton
                          aria-label={`Delete index for ${fieldName}`}
                          onClick={() => setFieldToDelete(fieldName)}
                          sx={{ color: 'text.primary' }}
                        >
                          <Trash size={'1.25rem'} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      <DeletePayloadIndexDialog
        collectionName={collectionName}
        fieldName={fieldToDelete}
        onClose={() => setFieldToDelete(null)}
        onSuccess={onSchemaChange}
      />
      <PayloadIndexDialog
        open={dialogState !== null}
        onClose={handleDialogClose}
        collectionName={collectionName}
        fieldName={dialogState?.fieldName || undefined}
        availableFields={availableFields}
        payloadSchema={payloadSchema}
        onSuccess={onSchemaChange}
      />
    </>
  );
};

PayloadIndexesCard.propTypes = {
  collectionName: PropTypes.string.isRequired,
  payloadSchema: PropTypes.object,
  onSchemaChange: PropTypes.func,
  forceCreateOpen: PropTypes.bool,
  onForceCreateClose: PropTypes.func,
};

export default PayloadIndexesCard;
