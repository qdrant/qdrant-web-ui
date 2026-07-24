import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import CollectionsList from './CollectionsList';
import { describe, it, expect } from 'vitest';

vi.mock('../../context/client-context', () => ({
  useClient: () => ({
    client: {
      deleteCollection: vi.fn().mockResolvedValue({}),
    },
  }),
}));

vi.mock('../Common/ActionsMenu', () => ({
  default: ({ children }) => <div>{children}</div>,
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
      metadata: {
        owner: 'team-a',
        purpose: 'search',
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

const DEFAULT_SELECTION_PROPS = {
  selectedCollections: new Set(),
  handleToggleSelect: vi.fn(),
  handleSelectAll: vi.fn(),
};

describe('CollectionsList', () => {
  it('should render CollectionsList with given data', () => {
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS}
          getCollectionsCall={() => {}}
          refreshCollection={vi.fn()}
          isRefreshing={false}
          {...DEFAULT_SELECTION_PROPS}
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
          refreshCollection={vi.fn()}
          isRefreshing={false}
          {...DEFAULT_SELECTION_PROPS}
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
    expect(screen.getByText('Metadata: {"owner":"team-a","purpose":"search"}')).toBeInTheDocument();
    expect(screen.getByText('Metadata: {"owner":"team-a","purpose":"search"}')).toHaveAttribute(
      'href',
      '/collections/Collection%201#info/collection-metadata'
    );
  });

  it('should truncate long metadata previews', () => {
    const longMetadata = {
      description: 'x'.repeat(120),
      nested: { key: 'value', another: 'field' },
    };
    const collections = [
      {
        ...COLLECTIONS[0],
        config: {
          ...COLLECTIONS[0].config,
          metadata: longMetadata,
        },
      },
    ];
    render(
      <MemoryRouter>
        <CollectionsList
          collections={collections}
          getCollectionsCall={() => {}}
          refreshCollection={vi.fn()}
          isRefreshing={false}
          {...DEFAULT_SELECTION_PROPS}
        />
      </MemoryRouter>
    );
    const preview = screen.getByText(/^Metadata: /);
    expect(preview.textContent).toMatch(/^Metadata: .{100}\.\.\.$/);
    expect(preview.textContent.length).toBe('Metadata: '.length + 100 + 3);
  });

  it('should render Refresh menu item in actions menu', () => {
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS}
          getCollectionsCall={() => {}}
          refreshCollection={vi.fn()}
          isRefreshing={false}
          {...DEFAULT_SELECTION_PROPS}
        />
      </MemoryRouter>
    );
    expect(screen.getAllByText('Refresh')).toHaveLength(COLLECTIONS.length);
  });

  it('should call refreshCollection with collection name when Refresh is clicked', () => {
    const mockRefresh = vi.fn();
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS}
          getCollectionsCall={() => {}}
          refreshCollection={mockRefresh}
          isRefreshing={false}
          {...DEFAULT_SELECTION_PROPS}
        />
      </MemoryRouter>
    );
    const refreshButtons = screen.getAllByText('Refresh');
    fireEvent.click(refreshButtons[0]);
    expect(mockRefresh).toHaveBeenCalledWith(COLLECTIONS[0].name);
  });

  it('should render an error row while keeping name and Delete available for unreadable collections', () => {
    const COLLECTIONS_WITH_ERROR = [
      COLLECTIONS[0],
      {
        name: 'Broken Collection',
        error: 'Service internal error: something went wrong',
        aliases: [],
      },
    ];
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS_WITH_ERROR}
          getCollectionsCall={() => {}}
          refreshCollection={vi.fn()}
          isRefreshing={false}
          {...DEFAULT_SELECTION_PROPS}
        />
      </MemoryRouter>
    );
    // Healthy collections still render alongside the broken one
    expect(screen.getByText('Collection 1')).toBeInTheDocument();
    // Broken collection keeps its name visible and surfaces the error
    expect(screen.getByText('Broken Collection')).toBeInTheDocument();
    expect(screen.getByText(/Service internal error: something went wrong/)).toBeInTheDocument();
    // Delete action remains available for the broken collection
    expect(screen.getAllByText('Delete')).toHaveLength(COLLECTIONS_WITH_ERROR.length);
  });

  it('should disable Refresh menu item when isRefreshing is true', () => {
    render(
      <MemoryRouter>
        <CollectionsList
          collections={COLLECTIONS}
          getCollectionsCall={() => {}}
          refreshCollection={vi.fn()}
          isRefreshing={true}
          {...DEFAULT_SELECTION_PROPS}
        />
      </MemoryRouter>
    );
    const refreshButtons = screen.getAllByText('Refresh');
    refreshButtons.forEach((btn) => {
      expect(btn.closest('li')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
