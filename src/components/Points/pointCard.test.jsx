import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PointCard from './PointCard';
import { describe, it, expect } from 'vitest';
import qdrantClient from '../../common/client';

function noop(...args) {
  // do nothing.
}

const client = qdrantClient({});

const SCORED_POINT = {
  id: 10,
  version: 3,
  score: 0.9621345,
  payload: {},
  vector: [0.325, 0.112, 0.2],
};

const UNSCORED_POINT = {
  id: 11,
  version: 3,
  payload: {},
  vector: [0.325, 0.112, 0.2],
};

describe('PointCard', () => {
  it('should render score when it is present', () => {
    render(
      <MemoryRouter>
        <PointCard
          point={SCORED_POINT}
          onConditionChange={noop}
          conditions={[]}
          collectionName="example"
          deletePoint={noop}
          payloadSchema={{}}
          client={client}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Point 10')).toBeInTheDocument();
    expect(screen.getByText('Score: 0.9621345')).toBeInTheDocument();
  });

  it('should not render score when it is not available', async () => {
    render(
      <MemoryRouter>
        <PointCard
          point={UNSCORED_POINT}
          onConditionChange={noop}
          conditions={[]}
          collectionName="example"
          deletePoint={noop}
          payloadSchema={{}}
          client={client}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Point 11')).toBeInTheDocument();
    expect(screen.queryByText('Score') === null);
    expect(screen.queryByText('Score: undefined') === null);
  });
});
