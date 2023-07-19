import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useClient } from "../../context/client-context";
import { useTheme } from "@mui/material/styles";
import {
  Box, Button, Grid, ListItemIcon, MenuItem,
  TableCell, TableContainer, TableRow, Tooltip,
} from "@mui/material";
import { Delete, Download, FolderZip, PhotoCamera } from "@mui/icons-material";
import {
  TableWithGaps, TableHeadWithGaps, TableBodyWithGaps,
} from "../Frame/TableWithGaps";
import ActionsMenu from "../Frame/ActionsMenu";
import prettyBytes from "pretty-bytes";

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
    <TableRow key={snapshot.name}>
      <TableCell>
        <Tooltip title={"Download snapshot"} arrow placement={"top"}>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => downloadSnapshot(snapshot.name)}>
            <FolderZip fontSize={"large"}
                       sx={{ color: theme.palette.primary.main, mr: 2 }}/>
            {snapshot.name}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell align="center">{snapshot.creation_time}</TableCell>
      <TableCell align="center">{prettyBytes(snapshot.size)}</TableCell>
      <TableCell align="right">
        <ActionsMenu>
          <MenuItem onClick={() => downloadSnapshot(snapshot.name)}>
            <ListItemIcon>
              <Download fontSize="small"/>
            </ListItemIcon>
            Download
          </MenuItem>
          <MenuItem
            sx={{
              color: theme.palette.error.main,
            }}
            onClick={() => deleteSnapshot(snapshot.name)}>
            <ListItemIcon>
              <Delete color="error" fontSize="small"/>
            </ListItemIcon>
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
        <TableContainer>
          <TableWithGaps aria-label="simple table">
            <TableHeadWithGaps>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Snapshot Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Created
                  at</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}
                           align="center">Size</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}
                           align="right">Action</TableCell>
              </TableRow>
            </TableHeadWithGaps>
            <TableBodyWithGaps>
              {tableRows}
            </TableBodyWithGaps>
          </TableWithGaps>
        </TableContainer>
      }
    </div>
  );
};

// props validation
SnapshotsTab.propTypes = {
  collectionName: PropTypes.string.isRequired,
};