import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TailwindConverter from '@/components/TailwindConverter';

// Mock the actual CSS processor to test real Tailwind class handling
jest.unmock('@/services/cssProcessor');

// Mock DOM APIs for the CSS processor
const mockElement = {
  className: '',
  style: {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    top: '-9999px',
    left: '-9999px',
  },
  parentNode: {
    removeChild: jest.fn(),
  },
};

const createMockComputedStyle = (styles: Record<string, string>) => ({
  getPropertyValue: jest.fn((prop: string) => styles[prop] || ''),
  length: Object.keys(styles).length,
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => mockElement),
    body: {
      appendChild: jest.fn(),
    },
  },
});

describe('Tailwind Classes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic utility classes', () => {
    it('should handle background color classes', async () => {
      const mockStyles = {
        'background-color': 'rgb(59, 130, 246)',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'bg-blue-500');

      await waitFor(() => {
        expect(screen.getByText('background-color')).toBeInTheDocument();
        expect(screen.getByText(': rgb(59, 130, 246);')).toBeInTheDocument();
      });
    });

    it('should handle text color classes', async () => {
      const mockStyles = {
        'color': 'rgb(255, 255, 255)',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'text-white');

      await waitFor(() => {
        expect(screen.getByText('color')).toBeInTheDocument();
        expect(screen.getByText(': rgb(255, 255, 255);')).toBeInTheDocument();
      });
    });

    it('should handle padding classes', async () => {
      const mockStyles = {
        'padding': '16px',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'p-4');

      await waitFor(() => {
        expect(screen.getByText('padding')).toBeInTheDocument();
        expect(screen.getByText(': 16px;')).toBeInTheDocument();
      });
    });

    it('should handle margin classes', async () => {
      const mockStyles = {
        'margin': '8px',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'm-2');

      await waitFor(() => {
        expect(screen.getByText('margin')).toBeInTheDocument();
        expect(screen.getByText(': 8px;')).toBeInTheDocument();
      });
    });
  });

  describe('Layout classes', () => {
    it('should handle flexbox classes', async () => {
      const mockStyles = {
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'flex items-center justify-center');

      await waitFor(() => {
        expect(screen.getByText('display')).toBeInTheDocument();
        expect(screen.getByText(': flex;')).toBeInTheDocument();
        expect(screen.getByText('align-items')).toBeInTheDocument();
        expect(screen.getByText(': center;')).toBeInTheDocument();
      });
    });

    it('should handle grid classes', async () => {
      const mockStyles = {
        'display': 'grid',
        'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
        'gap': '16px',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'grid grid-cols-3 gap-4');

      await waitFor(() => {
        expect(screen.getByText('display')).toBeInTheDocument();
        expect(screen.getByText(': grid;')).toBeInTheDocument();
        expect(screen.getByText('grid-template-columns')).toBeInTheDocument();
      });
    });
  });

  describe('Typography classes', () => {
    it('should handle font size classes', async () => {
      const mockStyles = {
        'font-size': '24px',
        'line-height': '32px',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'text-2xl');

      await waitFor(() => {
        expect(screen.getByText('font-size')).toBeInTheDocument();
        expect(screen.getByText(': 24px;')).toBeInTheDocument();
      });
    });

    it('should handle font weight classes', async () => {
      const mockStyles = {
        'font-weight': '700',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'font-bold');

      await waitFor(() => {
        expect(screen.getByText('font-weight')).toBeInTheDocument();
        expect(screen.getByText(': 700;')).toBeInTheDocument();
      });
    });
  });

  describe('Border and shadow classes', () => {
    it('should handle border classes', async () => {
      const mockStyles = {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': 'rgb(209, 213, 219)',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'border border-gray-300');

      await waitFor(() => {
        expect(screen.getByText('border-width')).toBeInTheDocument();
        expect(screen.getByText(': 1px;')).toBeInTheDocument();
      });
    });

    it('should handle border radius classes', async () => {
      const mockStyles = {
        'border-radius': '8px',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'rounded-lg');

      await waitFor(() => {
        expect(screen.getByText('border-radius')).toBeInTheDocument();
        expect(screen.getByText(': 8px;')).toBeInTheDocument();
      });
    });

    it('should handle shadow classes', async () => {
      const mockStyles = {
        'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'shadow-lg');

      await waitFor(() => {
        expect(screen.getByText('box-shadow')).toBeInTheDocument();
      });
    });
  });

  describe('Complex combinations', () => {
    it('should handle multiple classes together', async () => {
      const mockStyles = {
        'background-color': 'rgb(59, 130, 246)',
        'color': 'rgb(255, 255, 255)',
        'padding': '16px',
        'border-radius': '8px',
        'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'bg-blue-500 text-white p-4 rounded-lg shadow-md');

      await waitFor(() => {
        expect(screen.getByText('background-color')).toBeInTheDocument();
        expect(screen.getByText('color')).toBeInTheDocument();
        expect(screen.getByText('padding')).toBeInTheDocument();
        expect(screen.getByText('border-radius')).toBeInTheDocument();
        expect(screen.getByText('box-shadow')).toBeInTheDocument();
      });
    });

    it('should handle card-like component classes', async () => {
      const mockStyles = {
        'max-width': '384px',
        'margin': '0 auto',
        'background-color': 'rgb(255, 255, 255)',
        'border-radius': '12px',
        'box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'border-width': '1px',
        'border-color': 'rgb(229, 231, 235)',
        'padding': '24px',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'max-w-sm mx-auto bg-white rounded-xl shadow-xl border border-gray-200 p-6');

      await waitFor(() => {
        expect(screen.getByText('max-width')).toBeInTheDocument();
        expect(screen.getByText('background-color')).toBeInTheDocument();
        expect(screen.getByText('border-radius')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle invalid classes gracefully', async () => {
      const mockStyles = {
        'color': 'rgb(59, 130, 246)',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'text-blue-500 invalid-class-name');

      await waitFor(() => {
        expect(screen.getByText('color')).toBeInTheDocument();
        expect(screen.getByText('Warnings')).toBeInTheDocument();
        expect(screen.getByText(/Potentially invalid classes/)).toBeInTheDocument();
      });
    });

    it('should handle empty input', async () => {
      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.clear(input);

      await waitFor(() => {
        expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
      });
    });

    it('should handle whitespace-only input', async () => {
      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, '   ');

      await waitFor(() => {
        expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
      });
    });
  });

  describe('Performance with real classes', () => {
    it('should handle many classes efficiently', async () => {
      const mockStyles = {
        'background-color': 'rgb(59, 130, 246)',
        'color': 'rgb(255, 255, 255)',
        'padding': '16px',
        'margin': '8px',
        'border-radius': '8px',
        'font-size': '16px',
        'font-weight': '500',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      };

      (window as any).getComputedStyle = jest.fn(() => createMockComputedStyle(mockStyles));

      render(<TailwindConverter />);

      const manyClasses = [
        'bg-blue-500', 'text-white', 'p-4', 'm-2', 'rounded-lg',
        'text-base', 'font-medium', 'flex', 'items-center', 'justify-center',
        'hover:bg-blue-600', 'focus:outline-none', 'focus:ring-2',
        'focus:ring-blue-500', 'focus:ring-offset-2', 'transition-colors',
        'duration-200', 'ease-in-out', 'shadow-sm', 'border-0'
      ].join(' ');

      const input = screen.getByLabelText('Tailwind CSS classes input');
      
      const startTime = performance.now();
      await userEvent.type(input, manyClasses);
      
      await waitFor(() => {
        expect(screen.getByText('background-color')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });
  });
});