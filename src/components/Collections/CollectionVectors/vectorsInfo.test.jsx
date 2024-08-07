import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VectorsInfo from './VectorsInfo';
import { useClient } from '../../../context/client-context';

vi.mock('../../../context/client-context');

const COLLECTION_NAME = 'test_collection';

const VECTORS = {
  size: 512,
  distance: 'Cosine',
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

describe('collection vectors info', () => {
  beforeEach(() => {
    useClient.mockReturnValue({
      client: {
        scroll: vi.fn().mockResolvedValue({ points: [{ id: 1 }, { id: 2 }] }),
        query: vi.fn().mockResolvedValue({ points: [{ id: 1 }, { id: 2 }] }),
      },
    });
  });

  it('should render VectorsInfo with given data', () => {
    render(
      <MemoryRouter>
        <VectorsInfo collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    expect(screen.getByText('Vectors Info')).toBeInTheDocument();
    expect(screen.getByText('512')).toBeInTheDocument();
    expect(screen.getByText('Cosine')).toBeInTheDocument();
  });

  it('should render VectorsInfo with named vectors', () => {
    render(
      <MemoryRouter>
        <VectorsInfo collectionName={COLLECTION_NAME} vectors={VECTORS_NAMED} />
      </MemoryRouter>
    );
    expect(screen.getByText('Vectors Info')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getAllByText('512')).toHaveLength(2);
    expect(screen.getAllByText('Cosine')).toHaveLength(2);
  });

  it('should call onCheckIndexAccuracy when "Check index quality" button is clicked', async () => {
    render(
      <MemoryRouter>
        <VectorsInfo collectionName={COLLECTION_NAME} vectors={VECTORS} />
      </MemoryRouter>
    );
    const button = screen.getByLabelText('Check index quality');
    fireEvent.click(button);
    await waitFor(() => {
      expect(useClient().client.scroll).toHaveBeenCalled();
      expect(useClient().client.query).toHaveBeenCalled();
    });
  });
});
