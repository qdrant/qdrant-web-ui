import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CopyableGroupedNumber } from './CopyableGroupedNumber';

describe('CopyableGroupedNumber', () => {
  it('does not group digits below 10 000', () => {
    render(<CopyableGroupedNumber value={9999} />);
    expect(screen.getByText('9999')).toBeInTheDocument();
  });

  it('groups digits from 10 000 upward', () => {
    render(<CopyableGroupedNumber value={10000} />);
    expect(screen.getByText('10 000')).toBeInTheDocument();
  });

  it('writes plain digits to the clipboard on copy when display is grouped', () => {
    render(<CopyableGroupedNumber value={1234567} />);
    const node = screen.getByText('1 234 567');
    const setData = vi.fn();
    fireEvent.copy(node, { clipboardData: { setData } });
    expect(setData).toHaveBeenCalledWith('text/plain', '1234567');
  });
});
