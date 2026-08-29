import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import CollectionInfo from './CollectionInfo';
import { parseRefreshInterval, formatRefreshInterval } from './AutoRefreshControl';

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

describe('parseRefreshInterval', () => {
  it('parses values with units', () => {
    expect(parseRefreshInterval('45s')).toBe(45_000);
    expect(parseRefreshInterval('2m')).toBe(120_000);
    expect(parseRefreshInterval('500ms')).toBe(500);
    expect(parseRefreshInterval('1h')).toBe(3_600_000);
    expect(parseRefreshInterval('1.5m')).toBe(90_000);
    expect(parseRefreshInterval(' 10 s ')).toBe(10_000);
  });

  it('treats a bare number as seconds', () => {
    expect(parseRefreshInterval('7')).toBe(7_000);
  });

  it('rejects invalid input', () => {
    expect(parseRefreshInterval('')).toBeNull();
    expect(parseRefreshInterval('abc')).toBeNull();
    expect(parseRefreshInterval('-5s')).toBeNull();
    expect(parseRefreshInterval('0s')).toBeNull();
    expect(parseRefreshInterval('10x')).toBeNull();
  });
});

describe('formatRefreshInterval', () => {
  it('formats to the shortest readable unit', () => {
    expect(formatRefreshInterval(45_000)).toBe('45s');
    expect(formatRefreshInterval(120_000)).toBe('2m');
    expect(formatRefreshInterval(3_600_000)).toBe('1h');
    expect(formatRefreshInterval(500)).toBe('500ms');
    expect(formatRefreshInterval(90_000)).toBe('90s');
  });
});

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

  it('refreshes at a custom typed interval', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();
    expect(client.getCollection).toHaveBeenCalledTimes(1);

    await selectInterval('Custom…');
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Custom refresh interval value'), { target: { value: '7s' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });

    expect(screen.getByLabelText('Auto refresh interval')).toHaveTextContent('7s');

    await advanceTimers(0);
    expect(client.getCollection).toHaveBeenCalledTimes(2);

    await advanceTimers(7_000);
    expect(client.getCollection).toHaveBeenCalledTimes(3);
  });

  it('rejects an invalid custom interval', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();

    await selectInterval('Custom…');
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Custom refresh interval value'), { target: { value: 'nope' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });

    expect(screen.getByText(/Invalid interval/)).toBeInTheDocument();
    expect(client.getCollection).toHaveBeenCalledTimes(1);
  });

  it('rejects a custom interval below the 100ms minimum', async () => {
    render(<CollectionInfo collectionName={COLLECTION_NAME} />);
    await flushMicrotasks();

    await selectInterval('Custom…');
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Custom refresh interval value'), { target: { value: '50ms' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });

    expect(screen.getByText(/at least 100ms/)).toBeInTheDocument();
    expect(client.getCollection).toHaveBeenCalledTimes(1);
  });
});
