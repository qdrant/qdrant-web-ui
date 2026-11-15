import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PointsTabs from './PointsTabs';

vi.mock('./PointCard', () => ({
  default: ({ point }) => <div data-testid="point-card">Point {point.id}</div>,
}));

vi.mock('./PointsFilter/PointsFilter', () => ({
  default: ({ onSimilarIdsChange }) => <button onClick={() => onSimilarIdsChange([1])}>find similar</button>,
}));

const makePoints = (count) => Array.from({ length: count }, (_, i) => ({ id: i + 2 }));

const makeClient = (similarTotal) => ({
  getApiKey: vi.fn(),
  getCollection: vi.fn().mockResolvedValue({ payload_schema: {} }),
  scroll: vi.fn().mockResolvedValue({ points: [{ id: 1 }], next_page_offset: null }),
  query: vi
    .fn()
    .mockImplementation((_name, { limit }) => Promise.resolve({ points: makePoints(Math.min(limit, similarTotal)) })),
});

const renderSimilar = async (similarTotal) => {
  const client = makeClient(similarTotal);
  render(<PointsTabs collectionName="test_collection" client={client} />);
  await screen.findByText('Point 1');
  fireEvent.click(screen.getByText('find similar'));
  await waitFor(() => expect(client.query).toHaveBeenCalledTimes(1));
  await screen.findByText('Point 2');
  return client;
};

describe('PointsTabs similarity search', () => {
  it('should not offer Load More when all similar points fit on the first page', async () => {
    await renderSimilar(6);
    expect(screen.getAllByTestId('point-card')).toHaveLength(6);
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('should load the next page and hide Load More once the results run out', async () => {
    const client = await renderSimilar(15);
    expect(screen.getAllByTestId('point-card')).toHaveLength(10);

    fireEvent.click(screen.getByText('Load More'));
    await waitFor(() => expect(screen.getAllByTestId('point-card')).toHaveLength(15));
    expect(client.query).toHaveBeenLastCalledWith('test_collection', expect.objectContaining({ limit: 20 }));
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
  });

  it('should keep Load More while a full page is returned', async () => {
    await renderSimilar(25);
    fireEvent.click(screen.getByText('Load More'));
    await waitFor(() => expect(screen.getAllByTestId('point-card')).toHaveLength(20));
    expect(screen.getByText('Load More')).toBeInTheDocument();
  });
});
