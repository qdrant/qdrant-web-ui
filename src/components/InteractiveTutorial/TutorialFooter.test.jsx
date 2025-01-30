import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TutorialFooter } from './TutorialFooter';

// Mock client context
vi.mock('../../context/client-context', () => ({
  useClient: () => ({
    isRestricted: false
  })
}));

describe('TutorialFooter', () => {
  it('should render next and prev buttons correctly', () => {
    render(
      <MemoryRouter>
        <TutorialFooter pageSlug="filteringbeginner" />
      </MemoryRouter>
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should not render prev button on first page', () => {
    render(
      <MemoryRouter>
        <TutorialFooter pageSlug="quickstart" />
      </MemoryRouter>
    );

    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should not render next button on last page', () => {
    render(
      <MemoryRouter>
        <TutorialFooter pageSlug="multitenancy" />
      </MemoryRouter>
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });
});
