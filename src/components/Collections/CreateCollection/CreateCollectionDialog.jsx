import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { CreateCollectionForm } from 'create-collection-form';
import { AppBar, Dialog, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useClient } from '../../../context/client-context';
import {
  createCollection,
  getCreateCollectionConfiguration,
  createCollectionParams,
  createPayloadIndexParams,
} from './create-collection.js';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { Highlight, Prism } from 'prism-react-renderer';
import DialogContent from '@mui/material/DialogContent';
import createPrismTheme from '../../../theme/prism-theme';

const convertToRequest = (outputData) => {
  const collectionName = outputData?.collection_name || '<name>';

  const params = getCreateCollectionConfiguration(collectionName, outputData);
  const collectionParams = createCollectionParams(params);

  let result = `PUT /collections/${collectionName} \n` + JSON.stringify(collectionParams, null, 2) + '\n';

  if (params.payload_indexes) {
    result += '\n// Payload Indexes';
    for (const fieldConfig of params.payload_indexes) {
      result += `\nPUT /collections/${collectionName}/payload_indexes \n`;
      const payloadIndexParams = createPayloadIndexParams(fieldConfig);
      result += JSON.stringify(payloadIndexParams, null, 2) + '\n';
    }
  }

  return result;
};

const CreateCollectionDialog = ({ open, handleClose }) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();
  const dialogRef = React.useRef();

  const getScrollableParent = () => {
    if (dialogRef.current) {
      return dialogRef.current;
    }
    return window;
  };

  const customPrismTheme = createPrismTheme(theme);

  const renderJsonPreview = (outputData) => {
    const request = convertToRequest(outputData);

    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
          Equivalent Requests
        </Typography>
        <Box>
          <Highlight Prism={Prism} theme={customPrismTheme} code={request} language="json">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={className}
                style={{
                  ...style,
                  backgroundColor: 'transparent',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '12px',
                  marginTop: '8px',
                }}
              >
                {tokens.map((line, i) => {
                  const lineProps = getLineProps({ line, key: i });
                  const { key: lineKey, ...restLineProps } = lineProps;
                  return (
                    <div key={lineKey ?? i} {...restLineProps}>
                      {line.map((token, tIdx) => {
                        const tokenProps = getTokenProps({ token, key: tIdx });
                        const { key: tokenKey, ...restTokenProps } = tokenProps;
                        return <span key={tokenKey ?? tIdx} {...restTokenProps} />;
                      })}
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </Box>
      </Box>
    );
  };

  // This function has to return a promise that resolves to a value,
  // as it is used as `onFinish` prop for CreateCollectionForm.
  // otherwise, the form will not be cleared (for example, if an error occurs).
  const handleFinish = useCallback(
    async (data) => {
      let result = null;
      try {
        result = await createCollection(qdrantClient, data);
      } catch (e) {
        enqueueSnackbar(e.message, getSnackbarOptions('warning', closeSnackbar, 2000));
      } finally {
        handleClose();
      }
      return result;
    },
    [qdrantClient, handleClose]
  );

  return (
    <Dialog fullScreen open={open} onClose={handleClose} aria-labelledby="create-collection-dialog-title">
      <AppBar
        sx={{
          background: theme.palette.background.paperElevation1,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
        }}
      >
        <Toolbar
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', lg: '1424px' },
            minHeight: '48px',
            px: 2,
            py: 0.5,
            mx: 'auto',
          }}
        >
          <IconButton edge="start" color="default" onClick={handleClose} aria-label="close">
            <ArrowLeft size={24} />
          </IconButton>
          <Typography
            id="create-collection-dialog-title"
            sx={{
              ml: 1,
              flex: 1,
              color: theme.palette.text.primary,
            }}
            variant="body1"
            component="div"
          >
            Create New Collection
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent
        ref={dialogRef}
        sx={{
          p: 0,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: '100%', lg: '1440px' },
            p: '0 24px',
            mx: 'auto',
          }}
        >
          <CreateCollectionForm
            onFinish={handleFinish}
            onPreviewFormOutput={renderJsonPreview}
            scrollableParent={getScrollableParent}
            aria-label="Create Collection Form"
            aria-role="dialog"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

CreateCollectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default CreateCollectionDialog;
