import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import SearchQualityPanel from './SearchQualityPanel';
import { useClient } from '../../../context/client-context';

const mockFilterEditorWindow = vi.fn();
vi.mock('../../FilterEditorWindow', () => ({
  default: (props) => {
    mockFilterEditorWindow(props);
    return <div>FilterEditorWindow</div>;
  },
}));

vi.mock('../../../context/client-context');

const COLLECTION_NAME = 'test_collection';

const VECTORS = {
  '': {
    size: 512,
    distance: 'Cosine',
  },
};

const VECTORS_NAMED = {
  text: {
    size: 512,
    distance: 'Cosine',
  },
  image: {
    size: 512,
    distance: 'Cosine',
  },
};

describe('SearchQualityPannel', () => {
  beforeEach(() => {
    const mockQueryPoints = vi.fn().mockResolvedValue({
      data: { result: { points: [{ id: 1 }, { id: 2 }] }, status: 'ok', time: 0.005 },
    });
    useClient.mockReturnValue({
      client: {
        scroll: vi.fn().mockResolvedValue({ points: [{ id: 1 }, { id: 2 }] }),
        api: vi.fn().mockReturnValue({ queryPoints: mockQueryPoints }),
      },
    });
  });

  it('should render SearchQualityPannel with given data', () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    expect(screen.getByText('ANN Recall')).toBeInTheDocument();
    expect(screen.getByText('512')).toBeInTheDocument();
    expect(screen.getByText('Cosine')).toBeInTheDocument();
  });

  it('should render SearchQualityPannel with named vectors', () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS_NAMED} />
      </MemoryRouter>
    );
    expect(screen.getByText('ANN Recall')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getAllByText('512')).toHaveLength(2);
    expect(screen.getAllByText('Cosine')).toHaveLength(2);
  });

  it('should show the measured recall when no logger is passed', async () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    userEvent.click(screen.getAllByTestId('index-quality-check-button')[0]);
    // Both exact and ANN searches return the same points, so recall is 100%.
    expect(await screen.findByText('100.00%')).toBeInTheDocument();
  });

  it('should log the mean recall when the check finishes', async () => {
    const loggingFoo = vi.fn();
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS} loggingFoo={loggingFoo} />
      </MemoryRouter>
    );
    userEvent.click(screen.getAllByTestId('index-quality-check-button')[0]);
    await waitFor(() => {
      expect(loggingFoo).toHaveBeenCalledWith('Mean recall@10 for collection: 1 ± 0');
    });
  });

  it('should toggle advanced mode', () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    const switchButton = screen.getByRole('checkbox');
    fireEvent.click(switchButton);
    expect(switchButton).toBeChecked();
    expect(screen.getByText('FilterEditorWindow')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-mod-editor')).toBeInTheDocument();
  });
});
