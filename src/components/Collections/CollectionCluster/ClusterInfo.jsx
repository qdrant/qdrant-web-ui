import React from "react";
import PropTypes from "prop-types";
import {
  alpha,
  Card,
  CardHeader,
  Table,
  TableBody,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CopyButton } from "../../Common/CopyButton";
import ClusterInfoHead from "./ClusterInfoHead";
import ClusterShardRow from "./ClusterShardRow";

const ClusterInfo = ({ collectionCluster, ...other }) => {
  const theme = useTheme();

  const shards = [
    ...(collectionCluster.result?.local_shards || []),
    ...(collectionCluster.result?.remote_shards || []),
  ];

  const shardRows = shards.map((shard) => <ClusterShardRow
    shard={shard}
    clusterPeerId={collectionCluster.result?.peer_id}
    key={shard.shard_id.toString() + (shard.peer_id || "")}
  />);

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
        <ClusterInfoHead/>
        <TableBody>
          {shardRows}
        </TableBody>
      </Table>
    </Card>
  );
};

ClusterInfo.defaultProps = {
  collectionCluster: {
    result: {},
  },
};

ClusterInfo.propTypes = {
  collectionCluster: PropTypes.shape({
    result: PropTypes.shape({
      peer_id: PropTypes.number,
      local_shards: PropTypes.arrayOf(PropTypes.shape({
        shard_id: PropTypes.number,
        state: PropTypes.string,
      })),
      remote_shards: PropTypes.arrayOf(PropTypes.shape({
        shard_id: PropTypes.number,
        peer_id: PropTypes.number,
        state: PropTypes.string,
      })),
    }),
  }).isRequired,
  other: PropTypes.object,
};

export default ClusterInfo;