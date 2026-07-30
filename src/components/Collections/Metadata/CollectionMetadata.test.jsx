import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import CollectionMetadata from './CollectionMetadata';
import { useClient } from '../../../context/client-context';

vi.mock('../../../context/client-context', () => {
  const client = {
    updateCollection: vi.fn().mockResolvedValue(undefined),
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
const METADATA = { env: 'prod', replicas: 3, config: { region: 'eu' } };

describe('CollectionMetadata (json-view migration)', () => {
  beforeEach(() => {
    const { client } = useClient();
    client.updateCollection.mockClear();
  });

  it('renders the metadata tree via the new json view', async () => {
    render(<CollectionMetadata collectionName={COLLECTION_NAME} metadata={METADATA} />);

    expect(await screen.findByText('Metadata')).toBeInTheDocument();
    // Top-level keys are rendered by @uiw/react-json-view.
    expect(screen.getByText('env')).toBeInTheDocument();
    expect(screen.getByText('replicas')).toBeInTheDocument();
    expect(screen.getByText('config')).toBeInTheDocument();

    // Edit/delete actions are attached to every top-level field (primitive + object).
    expect(screen.getByLabelText('Edit metadata field env')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit metadata field replicas')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit metadata field config')).toBeInTheDocument();
  });

  it('edits a primitive field in place and patches the collection', async () => {
    const { client } = useClient();
    const onMetadataChange = vi.fn();
    render(
      <CollectionMetadata collectionName={COLLECTION_NAME} metadata={METADATA} onMetadataChange={onMetadataChange} />
    );

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Edit metadata field env'));
    });

    const input = await screen.findByPlaceholderText('JSON (Enter to save)');
    expect(input).toHaveValue('"prod"');

    await act(async () => {
      fireEvent.change(input, { target: { value: '"staging"' } });
    });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(client.updateCollection).toHaveBeenCalledWith(COLLECTION_NAME, {
        metadata: { env: 'staging' },
      });
    });
    expect(onMetadataChange).toHaveBeenCalled();
  });

  it('opens a multiline editor for an object field (portal + container hide)', async () => {
    render(<CollectionMetadata collectionName={COLLECTION_NAME} metadata={METADATA} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Edit metadata field config'));
    });

    // The object editor is portaled into the field's `.w-rjv-inner` container.
    const editor = await screen.findByPlaceholderText('JSON (Ctrl/Cmd+Enter to save)');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue(JSON.stringify({ region: 'eu' }, null, 2));
  });

  it('deletes a field after confirmation', async () => {
    const { client } = useClient();
    render(<CollectionMetadata collectionName={COLLECTION_NAME} metadata={METADATA} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Delete metadata field replicas'));
    });

    const confirmButton = await screen.findByTestId('confirm-delete-button');
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(client.updateCollection).toHaveBeenCalledWith(COLLECTION_NAME, {
        metadata: { replicas: null },
      });
    });
  });

  it('adds a field via the inline form', async () => {
    const { client } = useClient();
    const onForceAddClose = vi.fn();
    render(
      <CollectionMetadata
        collectionName={COLLECTION_NAME}
        metadata={METADATA}
        forceAddOpen
        onForceAddClose={onForceAddClose}
      />
    );

    const keyInput = await screen.findByPlaceholderText('key');
    const valueInput = await screen.findByPlaceholderText('value (Enter to save)');

    await act(async () => {
      fireEvent.change(keyInput, { target: { value: 'team' } });
      fireEvent.change(valueInput, { target: { value: '"platform"' } });
    });
    await act(async () => {
      fireEvent.keyDown(valueInput, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(client.updateCollection).toHaveBeenCalledWith(COLLECTION_NAME, {
        metadata: { team: 'platform' },
      });
    });
    expect(onForceAddClose).toHaveBeenCalled();
  });
});
