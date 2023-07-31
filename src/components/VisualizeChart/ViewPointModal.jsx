import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Snackbar,
} from '@mui/material';
import { alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CopyAll } from '@mui/icons-material';
import { PointPayloadList } from '../Points/PointPayloadList';

const ViewPointModal = (props) => {
  const theme = useTheme();
  const [openTooltip, setOpenTooltip] = React.useState(false);
  const { openViewPoints, setOpenViewPoints, viewPoints } = props;

  return (
    <>
      <Dialog
        open={openViewPoints}
        onClose={() => setOpenViewPoints(false)}
        scroll={'paper'}
        maxWidth={'lg'}
        fullWidth={true}
      >
        <DialogTitle id="scroll-dialog-title">Selected Points</DialogTitle>
        <DialogContent>
          {viewPoints.length > 0 ? (
            <>
              {viewPoints.map((point, index) => (
                <Paper key={`${index}-${point.id}`}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: alpha(theme.palette.primary.main, 0.05),
                      px: 3,
                      py: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      Point {point.id}
                    </Typography>

                    <Tooltip title="Copy JSON" placement="left">
                      <IconButton
                        aria-label="copy point"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(point));
                          setOpenTooltip(true);
                        }}
                      >
                        <CopyAll />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box px={3} pt={1} pb={5}>
                    <PointPayloadList data={point} sx={{ px: 3, py: 4 }} />
                  </Box>
                </Paper>
              ))}
            </>
          ) : (
            <Typography variant="h6" component="h2">
              no points selected
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewPoints(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openTooltip} severity="success" autoHideDuration={3000} onClose={() => setOpenTooltip(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Point JSON copied to clipboard.
        </Alert>
      </Snackbar>
    </>
  );
};

ViewPointModal.propTypes = {
  openViewPoints: PropTypes.bool.isRequired,
  setOpenViewPoints: PropTypes.func.isRequired,
  viewPoints: PropTypes.array.isRequired,
};

export default ViewPointModal;
