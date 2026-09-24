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

const renderDialog = () => {
  const setOpen = vi.fn();
  const onApply = vi.fn();
  render(<ApiKeyDialog open={true} setOpen={setOpen} onApply={onApply} />);
  return { setOpen, onApply };
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
    const { setOpen, onApply } = renderDialog();

    submitKey('valid-key');

    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect(setSettings).toHaveBeenCalledWith({ apiKey: 'valid-key' });
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('shows an error and does not apply an invalid key', async () => {
    getCollections.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }));
    const { setOpen, onApply } = renderDialog();

    submitKey('wrong-key');

    expect(await screen.findByText('API Key is invalid. Please check it and try again.')).toBeInTheDocument();
    expect(setSettings).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalled();
  });

  it('requires a key', () => {
    const { onApply } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByText('API Key is required')).toBeInTheDocument();
    expect(getCollections).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });
});
