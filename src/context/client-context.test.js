// The client takes its URL from the page; use https so the API key isn't sent over plain http.
// @vitest-environment-options {"url":"https://localhost"}
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useClient, ClientProvider } from './client-context';
import { bigIntJSON } from '../common/bigIntJSON';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock JWT token
const mockRestrictedToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3MiOlt7ImFjY2VzcyI6InBydyJ9XX0.x';
const mockUnrestrictedToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3MiOlt7ImFjY2VzcyI6InIifV19.x';

describe('useClient', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
  });

  it('should return isRestricted=true for restricted token', () => {
    mockLocalStorage.getItem.mockReturnValue(bigIntJSON.stringify({ apiKey: mockRestrictedToken }));

    const { result } = renderHook(() => useClient(), { wrapper: ClientProvider });

    expect(result.current.isRestricted).toBe(true);
  });

  it('should return isRestricted=false for unrestricted token', () => {
    mockLocalStorage.getItem.mockReturnValue(bigIntJSON.stringify({ apiKey: mockUnrestrictedToken }));

    const { result } = renderHook(() => useClient(), { wrapper: ClientProvider });

    expect(result.current.isRestricted).toBe(false);
  });

  it('should return isRestricted=false for no token', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useClient(), { wrapper: ClientProvider });

    expect(result.current.isRestricted).toBe(false);
  });

  it('should remount children when the API key changes', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    // State inside the provider survives re-renders, but is lost on remount.
    const { result } = renderHook(
      () => {
        const [marker, setMarker] = useState('initial');
        return { ...useClient(), marker, setMarker };
      },
      { wrapper: ClientProvider }
    );

    act(() => result.current.setMarker('changed'));
    const oldClient = result.current.client;

    act(() => result.current.setSettings({ ...result.current.settings, apiKey: 'new-key' }));

    expect(result.current.marker).toBe('initial');
    expect(result.current.client).not.toBe(oldClient);
    expect(result.current.client.getApiKey()).toBe('new-key');
  });

  it('should keep the same client when settings change without a new API key', () => {
    mockLocalStorage.getItem.mockReturnValue(bigIntJSON.stringify({ apiKey: 'key' }));

    const { result } = renderHook(() => useClient(), { wrapper: ClientProvider });
    const oldClient = result.current.client;

    act(() => result.current.setSettings({ ...result.current.settings }));

    expect(result.current.client).toBe(oldClient);
  });
});
