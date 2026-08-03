import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InfoCard from './InfoCard';

// Mock lucide-react icons
const MockIcon = ({ size, color }) => (
  <svg data-testid="mock-icon" width={size} height={size} stroke={color}>
    <path />
  </svg>
);

// Create a test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    info: {
      main: '#0288d1',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <MemoryRouter>
    <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
  </MemoryRouter>
);

describe('InfoCard', () => {
  const defaultProps = {
    icon: MockIcon,
    title: 'Test Title',
    description: 'Test Description',
    href: '/test-path',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('stroke', testTheme.palette.info.main);

      const cardContent = screen.getByText('Test Title').closest('.MuiCardContent-root');
      expect(cardContent).toHaveClass('side');
    });

    it('should render with custom link text', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} linkText="Custom Link" />
        </TestWrapper>
      );

      expect(screen.getByText('Custom Link')).toBeInTheDocument();
    });

    it('should render icon with correct props', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} iconColor="#ff0000" />
        </TestWrapper>
      );

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveAttribute('width', '20px');
      expect(icon).toHaveAttribute('height', '20px');
      expect(icon).toHaveAttribute('stroke', '#ff0000');
    });
  });

  describe('Icon Variants', () => {
    it('should render with side icon variant when explicitly set', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} iconVariant="side" />
        </TestWrapper>
      );

      const cardContent = screen.getByText('Test Title').closest('.MuiCardContent-root');
      expect(cardContent).toHaveClass('side');
    });

    it('should render with top icon variant', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} iconVariant="top" />
        </TestWrapper>
      );

      const cardContent = screen.getByText('Test Title').closest('.MuiCardContent-root');
      expect(cardContent).toHaveClass('top');
    });
  });

  describe('CTA Button', () => {
    it('should show CTA button by default', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('should hide CTA button when showCta is false', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} showCta={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Learn More' })).not.toBeInTheDocument();
    });

    it('should add margin-left class for side icon with CTA', () => {
      render(
        <TestWrapper>
          <InfoCard {...defaultProps} iconVariant="side" showCta={true} />
        </TestWrapper>
      );

      const linkButton = screen.getByRole('button', { name: 'Learn More' });
      expect(linkButton).toHaveClass('add-margin-left');
    });
  });
});
