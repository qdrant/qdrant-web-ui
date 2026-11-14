import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const get = vi.fn().mockResolvedValue({ data: {} });
vi.mock('../common/axios', () => ({ axiosInstance: { get } }));

const requestedPath = async (baseUrl) => {
  vi.resetModules();
  import.meta.env.BASE_URL = baseUrl;
  const { CloudInfoProvider } = await import('./cloud-info-context');
  get.mockClear();
  render(
    <CloudInfoProvider>
      <div />
    </CloudInfoProvider>
  );
  await waitFor(() => expect(get).toHaveBeenCalled());
  return get.mock.calls[0][0];
};

describe('CloudInfoProvider', () => {
  const baseUrl = import.meta.env.BASE_URL;

  afterEach(() => {
    import.meta.env.BASE_URL = baseUrl;
  });

  it('should request cloud info next to the dashboard with a relative base', async () => {
    expect(await requestedPath('./')).toBe(new URL('cloud/data.json', window.location.href).href);
  });

  it('should keep an absolute path as is', async () => {
    expect(await requestedPath('/dashboard/')).toBe('/dashboard/cloud/data.json');
    expect(await requestedPath('/')).toBe('/cloud/data.json');
  });
});
