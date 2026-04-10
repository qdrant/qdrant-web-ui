import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Optimizations from './Optimizations';

// Stub child components so tests only exercise the polling logic.
vi.mock('./ProgressGrid/ProgressGrid', () => ({ default: () => <div data-testid="progress-grid" /> }));
vi.mock('./Timeline/Timeline', () => ({ default: () => <div data-testid="timeline" /> }));
vi.mock('./Tree/OptimizationsTree', () => ({ default: () => <div data-testid="tree" /> }));

// Mock axios – we control what `.get` resolves to.
const getMock = vi.fn();
vi.mock('../../../common/axios', () => ({ axiosInstance: { get: (...args) => getMock(...args) } }));

/** Helper: build a response shaped like the real API. */
const apiResponse = (running = []) => ({
  data: { result: { running, completed: [], queued: [] } },
});

describe('Optimizations polling', () => {
  const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');

  beforeEach(() => {
    vi.useFakeTimers();
    getMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalHiddenDescriptor) {
      Object.defineProperty(document, 'hidden', originalHiddenDescriptor);
    } else {
      delete document.hidden;
    }
  });

  it('polls while running is non-empty and stops when empty', async () => {
    // First call: one running optimization → should schedule a poll.
    getMock
      .mockResolvedValueOnce(apiResponse([{ id: 1 }]))
      // Second call: still running → another poll.
      .mockResolvedValueOnce(apiResponse([{ id: 1 }]))
      // Third call: nothing running → no more polls.
      .mockResolvedValueOnce(apiResponse([]));

    await act(async () => {
      render(<Optimizations collectionName="test" />);
    });
    expect(getMock).toHaveBeenCalledTimes(1);

    // Advance past poll interval (4 s).
    await act(async () => vi.advanceTimersByTime(4000));
    expect(getMock).toHaveBeenCalledTimes(2);

    await act(async () => vi.advanceTimersByTime(4000));
    expect(getMock).toHaveBeenCalledTimes(3);

    // Running is now empty – no further fetch after another interval.
    await act(async () => vi.advanceTimersByTime(8000));
    expect(getMock).toHaveBeenCalledTimes(3);
  });

  it('resumes polling after a transient error while optimizations are running', async () => {
    getMock
      .mockResolvedValueOnce(apiResponse([{ id: 1 }]))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(apiResponse([{ id: 1 }]))
      .mockResolvedValueOnce(apiResponse([]));

    await act(async () => {
      render(<Optimizations collectionName="test" />);
    });
    expect(getMock).toHaveBeenCalledTimes(1);

    await act(async () => vi.advanceTimersByTime(4000));
    expect(getMock).toHaveBeenCalledTimes(2);

    await act(async () => vi.advanceTimersByTime(4000));
    expect(getMock).toHaveBeenCalledTimes(3);

    await act(async () => vi.advanceTimersByTime(4000));
    expect(getMock).toHaveBeenCalledTimes(4);

    await act(async () => vi.advanceTimersByTime(8000));
    expect(getMock).toHaveBeenCalledTimes(4);
  });

  it('pauses polling when document is hidden and resumes on visibility', async () => {
    getMock.mockResolvedValue(apiResponse([{ id: 1 }]));

    await act(async () => {
      render(<Optimizations collectionName="test" />);
    });
    expect(getMock).toHaveBeenCalledTimes(1);

    // Simulate tab becoming hidden.
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    // Polling timer should have been cleared – advancing time should not trigger a fetch.
    await act(async () => vi.advanceTimersByTime(8000));
    expect(getMock).toHaveBeenCalledTimes(1);

    // Simulate tab becoming visible again → should immediately re-fetch.
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(getMock).toHaveBeenCalledTimes(2);
  });

  it('aborts in-flight requests on unmount', async () => {
    let capturedSignal;
    getMock.mockImplementation((_url, opts) => {
      capturedSignal = opts?.signal;
      // Never resolve – simulates a long-running request.
      return new Promise(() => {});
    });

    let unmount;
    await act(async () => {
      ({ unmount } = render(<Optimizations collectionName="test" />));
    });

    expect(capturedSignal).toBeDefined();
    expect(capturedSignal.aborted).toBe(false);

    await act(async () => unmount());
    expect(capturedSignal.aborted).toBe(true);
  });

  it('aborts previous request when collectionName changes', async () => {
    let capturedSignal;
    getMock.mockImplementation((_url, opts) => {
      capturedSignal = opts?.signal;
      return new Promise(() => {});
    });

    let rerender;
    await act(async () => {
      ({ rerender } = render(<Optimizations collectionName="col_a" />));
    });

    const firstSignal = capturedSignal;
    expect(firstSignal.aborted).toBe(false);

    await act(async () => {
      rerender(<Optimizations collectionName="col_b" />);
    });

    expect(firstSignal.aborted).toBe(true);
  });
});
