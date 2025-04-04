import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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
    useClient.mockReturnValue({
      client: {
        scroll: vi.fn().mockResolvedValue({ points: [{ id: 1 }, { id: 2 }] }),
        query: vi.fn().mockResolvedValue({ points: [{ id: 1 }, { id: 2 }] }),
      },
    });
  });

  it('should render SearchQualityPannel with given data', () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    expect(screen.getByText('Search Quality')).toBeInTheDocument();
    expect(screen.getByText('512')).toBeInTheDocument();
    expect(screen.getByText('Cosine')).toBeInTheDocument();
  });

  it('should render SearchQualityPannel with named vectors', () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS_NAMED} />
      </MemoryRouter>
    );
    expect(screen.getByText('Search Quality')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getAllByText('512')).toHaveLength(2);
    expect(screen.getAllByText('Cosine')).toHaveLength(2);
  });

  it('should call onCheckIndexQuality when "Check index quality" button is clicked', async () => {
    render(
      <MemoryRouter>
        <SearchQualityPanel collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    const button = screen.getAllByTestId('index-quality-check-button')[0];
    fireEvent.click(button);
    await waitFor(() => {
      expect(useClient().client.scroll).toHaveBeenCalled();
      expect(useClient().client.query).toHaveBeenCalled();
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
