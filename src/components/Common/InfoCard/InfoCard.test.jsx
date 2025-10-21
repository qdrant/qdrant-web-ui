import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InfoCard from './InfoCard';
import { ChevronRight } from 'lucide-react';

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
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  ],
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <MemoryRouter>
    <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
  </MemoryRouter>
);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  describe('Navigation', () => {
    it('should not navigate when href is not provided', () => {
      const { href, ...propsWithoutHref } = defaultProps;

      // Capture console.error to verify the expected PropTypes warning
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <InfoCard {...propsWithoutHref} />
        </TestWrapper>
      );

      const card = screen.getAllByRole('button')[0];
      fireEvent.click(card);

      expect(mockNavigate).not.toHaveBeenCalled();

      // Verify that the expected PropTypes warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Failed %s type: %s%s'),
        'prop',
        expect.stringContaining('The prop `href` is marked as required'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });
  });
});
