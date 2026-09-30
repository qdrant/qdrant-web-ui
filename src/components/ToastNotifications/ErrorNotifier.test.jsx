import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorNotifier } from './ErrorNotifier';

const enqueueSnackbar = vi.fn();
const closeSnackbar = vi.fn();

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar,
    closeSnackbar,
  }),
}));

describe('ErrorNotifier', () => {
  it('passes the full message to the snackbar', async () => {
    const message = 'x'.repeat(300);

    render(<ErrorNotifier message={message} />);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(message, expect.any(Object));
    });
  });
});
