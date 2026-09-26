import React, { useRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect } from 'vitest';
import SlotTooltip, { slotTooltipAttributes } from './SlotTooltip';

const Grid = () => {
  const ref = useRef(null);
  return (
    <div ref={ref}>
      <div
        data-cluster-slot="true"
        data-testid="active"
        {...slotTooltipAttributes({ peerId: 2, slotId: 4, shard: { shard_id: 4, state: 'Active' } })}
      />
      <div
        data-cluster-slot="true"
        data-testid="moving"
        {...slotTooltipAttributes({
          peerId: 1,
          slotId: 3,
          shard: { shard_id: 3, state: 'Active', shard_key: 'tenant-a' },
          transferTo: 3,
        })}
      />
      <div data-cluster-slot="true" data-testid="empty" {...slotTooltipAttributes({ peerId: 3, slotId: 5 })} />
      <div
        data-cluster-slot="true"
        data-testid="drop"
        {...slotTooltipAttributes({ peerId: 3, slotId: 6, isDropTarget: true })}
      />
      <div data-testid="gap" />
      <SlotTooltip containerRef={ref} />
    </div>
  );
};

const renderGrid = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <Grid />
    </ThemeProvider>
  );

const hover = (testId) => act(() => fireEvent.mouseOver(screen.getByTestId(testId)));
const tooltipText = () => screen.getByRole('tooltip').textContent;

describe('SlotTooltip', () => {
  it('should describe the hovered shard', () => {
    renderGrid();

    hover('active');
    expect(tooltipText()).toContain('Peer Id: 2');
    expect(tooltipText()).toContain('Shard Id: 4');
    expect(tooltipText()).toContain('Shard State: Active');
    expect(tooltipText()).toContain('Drag to an empty slot to transfer');
  });

  it('should follow the pointer to another slot', () => {
    renderGrid();

    hover('active');
    hover('moving');
    expect(tooltipText()).toContain('Shard Key: tenant-a');
    expect(tooltipText()).toContain('Transferring to peer 3');
    expect(tooltipText()).not.toContain('Drag to an empty slot');
  });

  it('should describe empty slots and drop targets', () => {
    renderGrid();

    hover('empty');
    expect(tooltipText()).toContain('Slot Id: 5');
    expect(tooltipText()).toContain('Empty slot');

    hover('drop');
    expect(tooltipText()).toContain('Drop here to move shard');
  });

  it('should hide outside of the slots', async () => {
    renderGrid();

    hover('active');
    hover('gap');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('should update when the hovered slot changes under a still pointer', async () => {
    renderGrid();

    hover('active');
    act(() => {
      screen.getByTestId('active').setAttribute('data-transfer-to', '5');
    });
    await waitFor(() => expect(tooltipText()).toContain('Transferring to peer 5'));
  });

  it('should follow a hovered slot that was re-created', async () => {
    renderGrid();

    hover('active');
    const old = screen.getByTestId('active');
    const replacement = old.cloneNode();
    replacement.setAttribute('data-shard-state', 'Partial');
    act(() => {
      old.replaceWith(replacement);
    });
    await waitFor(() => expect(tooltipText()).toContain('Shard State: Partial'));
  });
});
