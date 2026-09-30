import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from './usePolling';

const setVisibility = (state) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the callback on every interval while enabled', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    renderHook(() => usePolling(callback, { enabled: true, interval: 1000 }));

    expect(callback).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(callback).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not run while disabled', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    renderHook(() => usePolling(callback, { enabled: false, interval: 1000 }));

    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(callback).not.toHaveBeenCalled();
  });

  it('waits for a slow run to finish before scheduling the next one', async () => {
    let resolve;
    const callback = vi.fn(() => new Promise((r) => (resolve = r)));
    renderHook(() => usePolling(callback, { enabled: true, interval: 1000 }));

    await act(() => vi.advanceTimersByTimeAsync(1000));
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => resolve());
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('keeps polling after a failed run', async () => {
    const callback = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue(undefined);
    renderHook(() => usePolling(callback, { enabled: true, interval: 1000 }));

    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('aborts the in-flight run and stops on unmount', async () => {
    let signal;
    const callback = vi.fn((s) => {
      signal = s;
      return new Promise(() => {});
    });
    const { unmount } = renderHook(() => usePolling(callback, { enabled: true, interval: 1000 }));

    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('pauses while the page is hidden and runs immediately once visible', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    renderHook(() => usePolling(callback, { enabled: true, interval: 1000 }));

    act(() => setVisibility('hidden'));
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(callback).not.toHaveBeenCalled();

    await act(async () => setVisibility('visible'));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
