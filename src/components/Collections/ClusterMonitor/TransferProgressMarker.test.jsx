import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect } from 'vitest';
import TransferProgressMarker from './TransferProgressMarker';

const COMMENT = 'transferring (12.34s) | Transferring records (45000/120000), ETA: 18.20s';

const transfer = (overrides = {}) => ({
  shard_id: 3,
  from: 1,
  to: 3,
  sync: true,
  method: 'stream_records',
  comment: COMMENT,
  ...overrides,
});

const renderMarker = (props) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <div>
        <TransferProgressMarker transfer={transfer(props)} />
        <button>outside</button>
      </div>
    </ThemeProvider>
  );

const marker = () => screen.getByRole('button', { name: 'Progress of the transfer of shard 3 from peer 1 to peer 3' });

describe('TransferProgressMarker', () => {
  it('should not show the tooltip on hover', async () => {
    renderMarker();

    await act(async () => userEvent.hover(marker()));
    expect(screen.queryByText(COMMENT)).not.toBeInTheDocument();
  });

  it('should show the comment as is on click, until a click outside', async () => {
    renderMarker();

    await act(async () => userEvent.click(marker()));
    expect(marker()).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText(COMMENT)).toBeInTheDocument();
    expect(screen.getByText('Shard 3: peer 1 → peer 3')).toBeInTheDocument();
    expect(screen.getByText('stream_records')).toBeInTheDocument();

    await act(async () => userEvent.unhover(marker()));
    expect(screen.getByText(COMMENT)).toBeInTheDocument();

    await act(async () => userEvent.click(screen.getByRole('button', { name: 'outside' })));
    expect(marker()).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByText(COMMENT)).not.toBeInTheDocument());
  });

  it('should close the tooltip on a second click', async () => {
    renderMarker();

    await act(async () => userEvent.click(marker()));
    await act(async () => userEvent.click(marker()));
    expect(marker()).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByText(COMMENT)).not.toBeInTheDocument());
  });

  it('should close the tooltip on Escape', async () => {
    renderMarker();

    await act(async () => userEvent.click(marker()));
    await act(async () => userEvent.keyboard('{Escape}'));
    expect(marker()).toHaveAttribute('aria-expanded', 'false');
  });

  it('should say when no progress is reported', async () => {
    renderMarker({ comment: null });

    await act(async () => userEvent.click(marker()));
    expect(await screen.findByText('No progress reported by this peer')).toBeInTheDocument();
  });
});
