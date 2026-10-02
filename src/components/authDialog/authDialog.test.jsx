import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiKeyDialog } from './authDialog';

const setSettings = vi.fn();
const getCollections = vi.fn();

vi.mock('../../context/client-context', () => ({
  useClient: () => ({ settings: { apiKey: '' }, setSettings }),
}));

vi.mock('../../common/client', () => ({
  default: () => ({ getCollections }),
}));

const renderDialog = (props = {}) => {
  const setOpen = vi.fn();
  render(<ApiKeyDialog open={true} setOpen={setOpen} {...props} />);
  return { setOpen };
};

const submitKey = (key) => {
  fireEvent.change(screen.getByPlaceholderText('API Key'), { target: { value: key } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
};

describe('ApiKeyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies a valid key', async () => {
    getCollections.mockResolvedValue({ collections: [] });
    const { setOpen } = renderDialog();

    submitKey('valid-key');

    await waitFor(() => expect(setSettings).toHaveBeenCalledWith({ apiKey: 'valid-key' }));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('shows an error and does not apply an invalid key', async () => {
    getCollections.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }));
    const { setOpen } = renderDialog();

    submitKey('wrong-key');

    expect(await screen.findByText('API Key is invalid. Please check it and try again.')).toBeInTheDocument();
    expect(setSettings).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalled();
  });

  it('requires a key', () => {
    renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByText('API Key is required')).toBeInTheDocument();
    expect(getCollections).not.toHaveBeenCalled();
    expect(setSettings).not.toHaveBeenCalled();
  });

  it('can be dismissed when no key is required', () => {
    const { setOpen } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('cannot be dismissed while a key is required', () => {
    const { setOpen } = renderDialog({ required: true });

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(setOpen).not.toHaveBeenCalled();
  });

  it('closes after a valid key is applied while a key is required', async () => {
    getCollections.mockResolvedValue({ collections: [] });
    const { setOpen } = renderDialog({ required: true });

    submitKey('valid-key');

    await waitFor(() => expect(setOpen).toHaveBeenCalledWith(false));
    expect(setSettings).toHaveBeenCalledWith({ apiKey: 'valid-key' });
  });
});
