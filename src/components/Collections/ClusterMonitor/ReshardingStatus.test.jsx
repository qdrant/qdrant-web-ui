import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect } from 'vitest';
import ReshardingStatus from './ReshardingStatus';

const renderWithTheme = (component) => render(<ThemeProvider theme={createTheme()}>{component}</ThemeProvider>);

const operation = (overrides = {}) => ({
  uuid: 'e41b28d9-52d9-4159-8b68-54b86b7ef53a',
  direction: 'down',
  shard_id: 2,
  peer_id: 8813425518402445,
  shard_key: null,
  ...overrides,
});

const progress = (overrides = {}) => ({
  uuid: 'e41b28d9-52d9-4159-8b68-54b86b7ef53a',
  direction: 'down',
  description: 'Stage 2/5: migrating points to the new shard (0/1 shards)',
  stage: 2,
  total_stages: 5,
  stage_key: 'migrate_points',
  completed: 0,
  total: 1,
  waiting: false,
  ...overrides,
});

describe('ReshardingStatus', () => {
  it('should render nothing when no operation is running', () => {
    const { container } = renderWithTheme(<ReshardingStatus operations={[]} progress={progress()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should report the reported progress of a scale down', () => {
    renderWithTheme(<ReshardingStatus operations={[operation()]} progress={progress()} />);

    expect(screen.getByText('Resharding down in progress: removing shard 2')).toBeInTheDocument();
    expect(
      screen.getByText('Stage 2/5: migrating points to the new shard (0/1 shards)', { exact: false })
    ).toBeInTheDocument();
  });

  it('should describe a scale up, including the shard key', () => {
    renderWithTheme(
      <ReshardingStatus operations={[operation({ direction: 'up', shard_id: 4, shard_key: 'us-east' })]} />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Resharding up in progress: adding shard 4 (shard key: us-east)'
    );
  });

  it('should only show the headline when no progress is reported', () => {
    const { container } = renderWithTheme(<ReshardingStatus operations={[operation()]} progress={null} />);

    expect(screen.getByText('Resharding down in progress: removing shard 2')).toBeInTheDocument();
    expect(container.querySelectorAll('.MuiTypography-body2')).toHaveLength(0);
  });

  it('should ignore a blank description', () => {
    const { container } = renderWithTheme(
      <ReshardingStatus operations={[operation()]} progress={progress({ description: '   ' })} />
    );

    expect(container.querySelectorAll('.MuiTypography-body2')).toHaveLength(0);
  });

  it('should mark a stage that is waiting', () => {
    renderWithTheme(<ReshardingStatus operations={[operation()]} progress={progress({ waiting: true })} />);

    expect(screen.getByRole('status')).toHaveTextContent('· waiting');
  });

  it('should list every target when several operations are running', () => {
    renderWithTheme(
      <ReshardingStatus
        operations={[operation(), operation({ uuid: '7b9c114c', direction: 'up', shard_id: 5 })]}
        progress={progress()}
      />
    );

    expect(screen.getByText('Resharding in progress: removing shard 2, adding shard 5')).toBeInTheDocument();
  });

  it('should announce progress updates to assistive technology', () => {
    renderWithTheme(<ReshardingStatus operations={[operation()]} progress={progress()} />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
