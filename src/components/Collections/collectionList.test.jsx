import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollectionsList from './CollectionsList';
import { describe, it, expect } from 'vitest';

vi.mock('../../context/client-context', () => ({
  useClient: () => ({
    client: {
      deleteCollection: vi.fn().mockResolvedValue({}),
    },
  }),
}));

const COLLECTIONS = [
  {
    name: 'Collection 1',
    status: 'green',
    points_count: 1000,
    segments_count: 10,
    config: {
      params: {
        shard_number: 2,
        vectors: {
          size: 128,
          distance: 'cosine',
        },
      },
    },
    aliases: ['alias1', 'alias2'],
  },
  {
    name: 'Collection 2',
    status: 'yellow',
    points_count: 500,
    segments_count: 5,
    config: {
      params: {
        shard_number: 1,
        vectors: {
          vector1: {
            size: 64,
            distance: 'euclidean',
          },
          vector2: {
            size: 32,
            distance: 'manhattan',
          },
        },
      },
    },
    aliases: [],
  },
];

describe('CollectionsList', () => {
  it('should render CollectionsList with given data', () => {
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS}
          getCollectionsCall={() => {}}
          currentPage={1}
          setCurrentPage={() => {}}
          pageSize={5}
          setPageSize={() => {}}
          allCollectionsLength={COLLECTIONS.length}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Collection 1')).toBeInTheDocument();
    expect(screen.getByText('Collection 2')).toBeInTheDocument();
  });

  it('should render CollectionTableRow with given data', () => {
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS}
          getCollectionsCall={() => {}}
          currentPage={1}
          setCurrentPage={() => {}}
          pageSize={5}
          setPageSize={() => {}}
          allCollectionsLength={COLLECTIONS.length}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('green')).toBeInTheDocument();
    expect(screen.getByText('yellow')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('cosine')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
    expect(screen.getByText('euclidean')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('manhattan')).toBeInTheDocument();
    expect(screen.getByText('Aliases: alias1, alias2')).toBeInTheDocument();
  });
});
