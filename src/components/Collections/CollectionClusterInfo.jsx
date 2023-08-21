import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  alpha, TableBody, Table, TableHead, TableRow, TableCell, Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CopyButton } from "../Common/CopyButton";

const InfoTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <Typography
            variant="subtitle1"
            fontWeight={600}
          >
            Shard ID
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="subtitle1"
            fontWeight={600}
          >
            Location
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="subtitle1"
            fontWeight={600}
          >
            Status
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const CollectionClusterInfo = ({ collectionCluster, ...other }) => {
  const theme = useTheme();

  const shards = [
    ...(collectionCluster.result?.local_shards || []),
    ...(collectionCluster.result?.remote_shards || []),
  ];

  const shardRows = shards.map((shard) => {
    return (
      <TableRow
        key={shard.shard_id.toString() + (shard.peer_id || "")}
        data-testid="shard-row"
      >
        <TableCell>
          <Typography
            variant="subtitle1"
            component={"span"}
            color="text.secondary">
            {shard.shard_id}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="subtitle1"
            component={"span"}
            color="text.secondary">
            {shard.peer_id ? `Remote (${shard.peer_id})` :
              `Local (${collectionCluster.result.peer_id})`}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="subtitle1"
            component={"span"}
            color="text.secondary">
            {shard.state}
          </Typography>
        </TableCell>
      </TableRow>
    );
  });

  return (
    <Card variant="dual" {...other}>
      <CardHeader
        title={"Collection Cluster Info"}
        sx={{
          flexGrow: 1,
          background: alpha(theme.palette.primary.main, 0.05),
        }}
        action={
          <CopyButton text={JSON.stringify(collectionCluster)}/>
        }
      />
      <Table>
        <InfoTableHead/>

        <TableBody>
          {shardRows}
        </TableBody>
      </Table>
    </Card>
  );
};

CollectionClusterInfo.defaultProps = {
  collectionCluster: {
    result: {},
  },
};

CollectionClusterInfo.propTypes = {
  collectionCluster: PropTypes.shape({
    result: PropTypes.shape({
      peer_id: PropTypes.number,
      local_shards: PropTypes.arrayOf(PropTypes.shape([{
        shard_id: PropTypes.number,
        peer_id: PropTypes.number,
        state: PropTypes.string,
      }])),
      remote_shards: PropTypes.arrayOf(PropTypes.shape([{
        shard_id: PropTypes.number,
        peer_id: PropTypes.number,
        state: PropTypes.string,
      }])),
    }),
  }).isRequired,
  other: PropTypes.object,
};

export default CollectionClusterInfo;