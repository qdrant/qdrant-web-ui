import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import CollectionInfo from './CollectionInfo';

const { enqueueSnackbarMock, closeSnackbarMock } = vi.hoisted(() => ({
  enqueueSnackbarMock: vi.fn(),
  closeSnackbarMock: vi.fn(),
}));

vi.mock('../../context/client-context', () => {
  const client = {
    getCollection: vi.fn().mockResolvedValue({ status: 'green' }),
    updateCollection: vi.fn().mockResolvedValue({}),
    api: vi.fn().mockReturnValue({
      collectionClusterInfo: vi.fn().mockResolvedValue({ data: { result: {} } }),
    }),
  };
  return {
    useClient: () => ({ client, isRestricted: false }),
  };
});

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: enqueueSnackbarMock,
    closeSnackbar: closeSnackbarMock,
  }),
}));

import { useClient } from '../../context/client-context';

const COLLECTION_NAME = 'test_collection';

const flushMicrotasks = async () => {
  await act(async () => {});
};

const advanceTimers = async (ms) => {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
};

const selectInterval = async (label) => {
  await act(async () => {
    fireEvent.click(screen.getByLabelText('Auto refresh interval'));
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('menuitem', { name: label }));
  });
};

describe('CollectionInfo', () => {
  let client;

  beforeEach(() => {
    client = useClient().client;
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches collection info on mount', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();

    expect(client.getCollection).toHaveBeenCalledTimes(1);
    expect(client.getCollection).toHaveBeenCalledWith(COLLECTION_NAME);
  });

  it('refreshes immediately and then at the selected interval', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();
    expect(client.getCollection).toHaveBeenCalledTimes(1);

    await selectInterval('5s');
    await advanceTimers(0);
    expect(client.getCollection).toHaveBeenCalledTimes(2);

    await advanceTimers(5_000);
    expect(client.getCollection).toHaveBeenCalledTimes(3);

    await advanceTimers(5_000);
    expect(client.getCollection).toHaveBeenCalledTimes(4);
  });

  it('stops auto refresh when set to Off', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();

    await selectInterval('5s');
    await advanceTimers(0);
    await advanceTimers(5_000);
    expect(client.getCollection).toHaveBeenCalledTimes(3);

    await selectInterval('Off');
    await advanceTimers(5_000);
    expect(client.getCollection).toHaveBeenCalledTimes(3);
  });

  it('clears the timer on unmount', async () => {
    const { unmount } = render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();

    await selectInterval('5s');
    await advanceTimers(0);
    expect(client.getCollection).toHaveBeenCalledTimes(2);

    unmount();
    await advanceTimers(5_000);
    expect(client.getCollection).toHaveBeenCalledTimes(2);
  });

  it('does not show error snackbars for background refresh failures', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();

    client.getCollection.mockRejectedValue(new Error('boom'));

    await selectInterval('5s');
    await advanceTimers(0);
    await advanceTimers(5_000);

    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('shows error snackbars for manual refresh failures', async () => {
    client.getCollection.mockRejectedValue(new Error('boom'));
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();
    enqueueSnackbarMock.mockClear();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Refresh collection info'));
    });
    await flushMicrotasks();

    expect(enqueueSnackbarMock).toHaveBeenCalledWith('boom', expect.anything());
  });
});