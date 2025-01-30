import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClient, ClientProvider } from './client-context';
import { bigIntJSON } from '../common/bigIntJSON';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
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
});
