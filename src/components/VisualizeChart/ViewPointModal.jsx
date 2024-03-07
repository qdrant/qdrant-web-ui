import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, DialogContent, DialogActions, DialogTitle, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGridList } from '../Points/DataGridList';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';

const ViewPointModal = (props) => {
  const theme = useTheme();
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
              <Paper variant="dual">
                {viewPoints.map((point, index) => (
                  <React.Fragment key={`${index}-${point.id}`}>
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

                      <CopyButton text={ bigIntJSON.stringify(point)} />
                    </Box>
                    <Box px={3} pt={1} pb={5}>
                      <DataGridList data={point.payload} sx={{ px: 3, py: 4 }} />
                    </Box>
                  </React.Fragment>
                ))}
              </Paper>
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
    </>
  );
};

ViewPointModal.propTypes = {
  openViewPoints: PropTypes.bool.isRequired,
  setOpenViewPoints: PropTypes.func.isRequired,
  viewPoints: PropTypes.array.isRequired,
};

export default ViewPointModal;
