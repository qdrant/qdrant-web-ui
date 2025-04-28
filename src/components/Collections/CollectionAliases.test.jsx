import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollectionAliases from './CollectionAliases';
import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { useClient } from '../../context/client-context';

vi.mock('../../context/client-context', () => {
  const client = {
    getCollectionAliases: vi.fn().mockImplementation((collectionName) => {
      if (collectionName === 'test_collection') {
        return Promise.resolve({
          aliases: [
            { alias_name: 'alias1', collection_name: 'test_collection' },
            { alias_name: 'alias2', collection_name: 'test_collection' },
          ],
        });
      } else {
        return Promise.resolve({ aliases: [] });
      }
    }),
    updateCollectionAliases: vi.fn().mockResolvedValue(undefined),
  };

  return {
    useClient: () => ({ client }),
  };
});

vi.mock('notistack', () => ({
  enqueueSnackbar: vi.fn(),
  closeSnackbar: vi.fn(),
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
    closeSnackbar: vi.fn(),
  }),
}));

const COLLECTION_NAME = 'test_collection';

describe('CollectionAliases', () => {
  it('should render CollectionAliases without aliases', async () => {
    render(
      <MemoryRouter>
        <CollectionAliases collectionName={'collection_without_aliases'} />
      </MemoryRouter>
    );
    expect(await screen.findByText('Aliases')).toBeInTheDocument();
    expect(await screen.findByText('No aliases found')).toBeInTheDocument();
  });

  it('should render CollectionAliases with given data', async () => {
    render(
      <MemoryRouter>
        <CollectionAliases collectionName={COLLECTION_NAME} />
      </MemoryRouter>
    );
    expect(await screen.findByText('Aliases')).toBeInTheDocument();
    expect(await screen.findByText('alias1')).toBeInTheDocument();
    expect(await screen.findByText('alias2')).toBeInTheDocument();
    expect(await screen.findByTestId('delete-alias-alias1')).toBeInTheDocument();
    expect(await screen.findByTestId('delete-alias-alias2')).toBeInTheDocument();
  });

  it('should handle alias creation', async () => {
    const { client } = useClient();
    render(
      <MemoryRouter>
        <CollectionAliases collectionName={COLLECTION_NAME} />
      </MemoryRouter>
    );

    // Open the Create Alias dialog
    const createButton = screen.getByText('Create alias');
    expect(createButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('create-alias-dialog')).toBeInTheDocument();
    });

    // Fill in the alias name input
    const input = screen.getByTestId('alias-name-input').querySelector('input');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'new_alias' } });
    });
    expect(input).toHaveValue('new_alias');

    // Submit the form
    const submitButton = screen.getByTestId('create-alias-button');
    expect(submitButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Assert the client method was called with the correct arguments
    expect(client.updateCollectionAliases).toHaveBeenCalledWith({
      actions: [
        {
          create_alias: {
            collection_name: COLLECTION_NAME,
            alias_name: 'new_alias',
          },
        },
      ],
    });
  });

  it('should handle alias deletion', async () => {
    const { client } = useClient();
    render(
      <MemoryRouter>
        <CollectionAliases collectionName={COLLECTION_NAME} />
      </MemoryRouter>
    );

    // Click the delete button for alias1
    const deleteButton = await screen.findByTestId('delete-alias-alias1');
    expect(deleteButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Confirm the deletion
    const confirmButton = screen.getByTestId('confirm-delete-button');
    expect(confirmButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Assert the client method was called with the correct arguments
    expect(client.updateCollectionAliases).toHaveBeenCalledWith({
      actions: [
        {
          delete_alias: {
            alias_name: 'alias1',
          },
        },
      ],
    });
  });
});
