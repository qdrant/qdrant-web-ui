import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClusterInfo from './ClusterInfo';
import ClusterShardRow from './ClusterShardRow';

// Mock client context
vi.mock('../../../context/client-context', () => ({
  useClient: () => ({
    client: {},
    isRestricted: false
  })
}));

const CLUSTER_INFO = {
  result: {
    peer_id: 5644950770669488,
    shard_count: 3,
    local_shards: [
      {
        shard_id: 0,
        points_count: 62223,
        state: 'Active',
      },
      {
        shard_id: 2,
        points_count: 65999,
        state: 'Active',
      },
    ],
    remote_shards: [
      {
        shard_id: 0,
        peer_id: 5255497362296823,
        state: 'Active',
      },
      {
        shard_id: 1,
        peer_id: 5255497362296823,
        state: 'Active',
      },
      {
        shard_id: 1,
        peer_id: 8741461806010521,
        state: 'Active',
      },
      {
        shard_id: 2,
        peer_id: 8741461806010521,
        state: 'Active',
      },
    ],
    shard_transfers: [],
  },
  status: 'ok',
  time: 0.00002203,
};

describe('collection cluster info', () => {
  it('should render ClusterShardRow with given data', () => {
    const shard = CLUSTER_INFO.result.remote_shards[0];
    render(
      <table>
        <tbody>
          <ClusterShardRow shard={shard} clusterPeerId={CLUSTER_INFO.result.peer_id} />
        </tbody>
      </table>
    );
    expect(screen.getByTestId('shard-row').children[0].children[0].textContent).toBe(shard.shard_id.toString());
    expect(screen.getByText(`Remote (${shard.peer_id})`)).toBeTruthy();
    expect(screen.getByText(shard.state)).toBeTruthy();
  });

  it('should render CollectionClusterInfo with given data', () => {
    const shardReplicasCount = CLUSTER_INFO.result.local_shards.length + CLUSTER_INFO.result.remote_shards.length;
    render(<ClusterInfo collectionCluster={CLUSTER_INFO} />);
    expect(screen.getByText('Collection Cluster Info')).toBeTruthy();
    expect(screen.getAllByTestId('shard-row').length).toBe(shardReplicasCount);
  });
});
