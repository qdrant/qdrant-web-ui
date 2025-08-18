import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ShardTransferDialog from './ShardTransferDialog';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window.matchMedia for JsonViewer component
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock the CopyButton component
vi.mock('../../Common/CopyButton', () => ({
  CopyButton: ({ text, tooltip, successMessage }) => (
    <button data-testid="copy-button" title={tooltip} data-success-message={successMessage}>
      Copy
    </button>
  ),
}));

const mockTransferRequest = {
  shard: {
    shard_id: 1,
    state: 'Active',
    shard_key: 'test-key',
  },
  fromPeerId: 100,
  toPeerId: 200,
};

const mockCollectionName = 'test-collection';

const renderWithTheme = (component) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ShardTransferDialog', () => {
  it('should not render when transferRequest is null', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={null}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.queryByText('Transfer Shard')).not.toBeInTheDocument();
  });

  it('should render dialog with correct title and description', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText('Transfer Shard')).toBeInTheDocument();
  });

  it('should display shard information correctly', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    // Check shard details section specifically
    const shardDetailsSection = screen.getByText('Shard Details').closest('div');
    expect(shardDetailsSection).toBeInTheDocument();

    // Check that the shard details are displayed in the grid
    expect(shardDetailsSection).toHaveTextContent('ID:');
    expect(shardDetailsSection).toHaveTextContent('1'); // shard_id
    expect(shardDetailsSection).toHaveTextContent('State:');
    expect(shardDetailsSection).toHaveTextContent('Active'); // state
    expect(shardDetailsSection).toHaveTextContent('Key:');
    expect(shardDetailsSection).toHaveTextContent('test-key'); // shard_key
    expect(shardDetailsSection).toHaveTextContent('From Peer:');
    expect(shardDetailsSection).toHaveTextContent('100'); // fromPeerId
    expect(shardDetailsSection).toHaveTextContent('To Peer:');
    expect(shardDetailsSection).toHaveTextContent('200'); // toPeerId
  });

  it('should display info alert with correct message', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText(/This action will move shard 1 from peer 100 to peer 200/)).toBeInTheDocument();
    expect(screen.getByText(/Shard key: test-key/)).toBeInTheDocument();
  });

  it('should display request section with copy button', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText('Request')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toHaveAttribute('title', 'Copy request to clipboard');
  });

  it('should display HTTP method and endpoint', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText('POST collections/test-collection/cluster')).toBeInTheDocument();
  });

  it('should display shard details in a grid layout', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText('Shard Details')).toBeInTheDocument();
    expect(screen.getByText('ID:')).toBeInTheDocument();
    expect(screen.getByText('State:')).toBeInTheDocument();
    expect(screen.getByText('Key:')).toBeInTheDocument();
    expect(screen.getByText('From Peer:')).toBeInTheDocument();
    expect(screen.getByText('To Peer:')).toBeInTheDocument();
  });

  it('should handle shard without shard_key gracefully', () => {
    const requestWithoutKey = {
      ...mockTransferRequest,
      shard: {
        ...mockTransferRequest.shard,
        shard_key: undefined,
      },
    };

    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={requestWithoutKey}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText(/This action will move shard 1 from peer 100 to peer 200/)).toBeInTheDocument();
    expect(screen.queryByText(/Shard key:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Key:')).not.toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();

    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={mockOnClose}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn();

    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={mockOnConfirm}
        collectionName={mockCollectionName}
      />
    );

    const confirmButton = screen.getByText('Confirm Transfer');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(mockTransferRequest);
  });

  it('should disable buttons when loading', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        loading={true}
        collectionName={mockCollectionName}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Transferring...');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('should show loading state in confirm button', () => {
    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={mockTransferRequest}
        onConfirm={vi.fn()}
        loading={true}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText('Transferring...')).toBeInTheDocument();
  });

  it('should handle different shard states', () => {
    const inactiveShard = {
      ...mockTransferRequest,
      shard: {
        ...mockTransferRequest.shard,
        state: 'Inactive',
      },
    };

    renderWithTheme(
      <ShardTransferDialog
        open={true}
        onClose={vi.fn()}
        transferRequest={inactiveShard}
        onConfirm={vi.fn()}
        collectionName={mockCollectionName}
      />
    );

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
