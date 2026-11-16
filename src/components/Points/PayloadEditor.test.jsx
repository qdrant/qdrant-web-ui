import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PayloadEditor } from './PayloadEditor';
import { useClient } from '../../context/client-context';

vi.mock('@mui/material', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Dialog: ({ open, children }) => (open ? <div role="dialog">{children}</div> : null),
  DialogActions: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogContent: ({ children }) => <div>{children}</div>,
}));

vi.mock('@mui/material/styles', () => ({ useTheme: () => ({ palette: { mode: 'light' } }) }));

vi.mock('../../context/client-context', () => ({
  useClient: () => ({ client: { overwritePayload, setPayload } }),
}));

const { overwritePayload, setPayload } = vi.hoisted(() => ({
  overwritePayload: vi.fn(),
  setPayload: vi.fn(),
}));

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: vi.fn(), closeSnackbar: vi.fn() }),
}));

vi.mock('react-router', () => ({ useParams: () => ({ collectionName: 'test_collection' }) }));

// Keep the editor boundary lightweight; each dialog mount starts from its supplied value.
vi.mock('../EditorCommon', () => ({
  default: ({ value, onChange }) => (
    <textarea aria-label="Payload JSON" defaultValue={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

vi.mock('react-diff-viewer-continued', () => ({
  default: ({ newValue }) => <pre data-testid="payload-diff">{newValue}</pre>,
}));

const initialPoint = { id: 1, payload: { status: 'original' } };

const EditorHarness = ({ point = initialPoint, onSave = vi.fn() }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open editor</button>
      <PayloadEditor point={point} open={open} onClose={() => setOpen(false)} onSave={onSave} setLoading={vi.fn()} />
    </>
  );
};

const closeEditor = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Payload JSON' })).not.toBeInTheDocument());
};

describe('PayloadEditor draft lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useClient().client.overwritePayload.mockResolvedValue({ status: 'completed' });
    useClient().client.setPayload.mockResolvedValue({ status: 'completed' });
  });

  it('discards canceled edits before reopening the same point', async () => {
    render(<EditorHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{"status":"discarded"}' } });
    await closeEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    expect(JSON.parse(screen.getByRole('textbox').value)).toEqual(initialPoint.payload);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.queryByText('Confirm to save payload changes')).not.toBeInTheDocument();
    expect(overwritePayload).not.toHaveBeenCalled();
    expect(setPayload).not.toHaveBeenCalled();
  });

  it('starts with the latest payload when the point changes while closed', () => {
    const { rerender } = render(<EditorHarness />);
    const updatedPoint = { id: 2, payload: { status: 'latest' } };
    rerender(<EditorHarness point={updatedPoint} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    expect(JSON.parse(screen.getByRole('textbox').value)).toEqual(updatedPoint.payload);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.queryByText('Confirm to save payload changes')).not.toBeInTheDocument();
    expect(overwritePayload).not.toHaveBeenCalled();
  });

  it('confirms and saves the new draft after discarding an earlier edit', async () => {
    const onSave = vi.fn();
    render(<EditorHarness onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{"status":"discarded"}' } });
    await closeEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{"status":"saved"}' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(JSON.parse(screen.getByTestId('payload-diff').textContent)).toEqual({ status: 'saved' });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(overwritePayload).toHaveBeenCalledWith('test_collection', {
        payload: { status: 'saved' },
        points: [1],
        wait: true,
      })
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ status: 'saved' }));
  });
});
