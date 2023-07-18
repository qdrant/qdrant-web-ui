import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useClient } from "../../context/client-context";
import {
  Button, darken,
  Grid, MenuItem, Paper,
  Table, TableBody, TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import ActionsMenu from "../Frame/ActionsMenu";
import { useTheme } from "@mui/material/styles";

export const SnapshotsTab = ({ collectionName }) => {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    qdrantClient.listSnapshots(collectionName).then((res) => {
      setSnapshots([...res]);
    }).catch((err) => {
      setError(err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [qdrantClient, collectionName]);

  const createSnapshot = () => {
    setIsLoading(true);
    qdrantClient.createSnapshot(collectionName).then((res) => {
      setSnapshots([...snapshots, res]);
    }).catch((err) => {
      setError(err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const downloadSnapshot = (snapshotName) => {
    // open new browser tab with download link
    window.open(
      `${qdrantClient._restUri}/collections/${collectionName}/snapshots/${snapshotName}`);
  };

  const deleteSnapshot = (snapshotName) => {
    setIsLoading(true);
    qdrantClient.deleteSnapshot(collectionName, snapshotName).then(() => {
      setSnapshots(
        [...snapshots.filter((snapshot) => snapshot.name !== snapshotName)]);
    }).catch((err) => {
      setError(err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const tableRows = snapshots.map((snapshot) => (
    <TableRow
      key={snapshot.name}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {snapshot.name}
      </TableCell>
      <TableCell align="center">{snapshot.creation_time}</TableCell>
      <TableCell align="center">{snapshot.size}</TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem onClick={() => downloadSnapshot(snapshot.name)}>
            Download
          </MenuItem>
          <MenuItem
            sx={{
              color: theme.palette.common.white,
              background: theme.palette.error.main,
              "&:hover": { background: darken(theme.palette.error.main, 0.06) },
            }}
            onClick={() => deleteSnapshot(snapshot.name)}>
            Delete
          </MenuItem>
        </ActionsMenu>
      </TableCell>
    </TableRow>
  ));

  return (
    <div>
      <Grid container alignItems="center">
        <Grid item xs={12} md={8}>
          <h1>Snapshots</h1>
        </Grid>
        <Grid item xs={12} md={4}
              sx={{ display: "flex", justifyContent: "end" }}>
          <Button
            variant={"contained"}
            onClick={createSnapshot}
            startIcon={<PhotoCamera fontSize={"small"}/>}
          >Take snapshot</Button>
        </Grid>
      </Grid>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {!isLoading && !error && snapshots?.length &&
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{background: theme.palette.paper}}>
                <TableCell>Snapshot Name</TableCell>
                <TableCell align="center">Created at</TableCell>
                <TableCell align="center">Size</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </TableContainer>
      }
    </div>
  );
};

// props validation
SnapshotsTab.propTypes = {
  collectionName: PropTypes.string.isRequired,
};