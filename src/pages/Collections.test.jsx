import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Collections from './Collections';

const getCollections = vi.fn();
const getAliases = vi.fn();
const getCollection = vi.fn();
const getApiKey = vi.fn();
const client = {
  getCollections,
  getAliases,
  getCollection,
  getApiKey,
};

vi.mock('../context/client-context', () => ({
  useClient: () => ({
    client,
  }),
}));

vi.mock('../context/telemetry-context', () => ({
  useMaxCollections: () => ({ maxCollections: null }),
}));

vi.mock('../components/Collections/SearchBar', () => ({
  default: ({ value, setValue }) => (
    <input aria-label="Search collections" value={value} onChange={(event) => setValue(event.target.value)} />
  ),
}));

vi.mock('../components/Collections/CollectionsList', () => ({
  default: ({ collections }) => <div data-testid="collections-list">{collections.map((item) => item.name).join(',')}</div>,
}));

vi.mock('../components/Collections/CreateCollection/CreateCollectionButton', () => ({
  default: () => <button type="button">Create collection</button>,
}));

vi.mock('../components/Snapshots/SnapshotsUpload', () => ({
  SnapshotsUpload: () => <button type="button">Upload snapshot</button>,
}));

vi.mock('../components/ToastNotifications/ErrorNotifier', () => ({
  default: ({ message }) => <div>{message}</div>,
}));

describe('Collections page size', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    getCollections.mockResolvedValue({
      collections: [{ name: 'alpha' }, { name: 'beta' }, { name: 'gamma' }],
    });
    getAliases.mockResolvedValue({ aliases: [] });
    getCollection.mockImplementation(async (name) => ({ vectors_count: name.length }));
    getApiKey.mockReturnValue(null);
  });

  it('fetches collections once on initial render', async () => {
    render(<Collections />);

    await screen.findByTestId('collections-list');

    await waitFor(() => {
      expect(getCollections).toHaveBeenCalledTimes(1);
    });
  });

  it('falls back to the default page size when localStorage has an unsupported value', async () => {
    localStorage.setItem('qdrant-web-ui-collections-page-size', '999');

    render(<Collections />);

    const pageSizeSelect = await screen.findByRole('combobox', { name: 'Collections per page' });
    expect(pageSizeSelect).toHaveTextContent('5');
  });

  it('persists a newly selected page size', async () => {
    render(<Collections />);

    const pageSizeSelect = await screen.findByRole('combobox', { name: 'Collections per page' });
    fireEvent.mouseDown(pageSizeSelect);

    const option = await screen.findByRole('option', { name: '10' });
    fireEvent.click(option);

    await waitFor(() => {
      expect(localStorage.getItem('qdrant-web-ui-collections-page-size')).toBe('10');
    });
  });
});
