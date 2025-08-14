import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TailwindConverter from '@/components/TailwindConverter';

// Mock the CSS processor to control behavior in tests
jest.mock('@/services/cssProcessor', () => {
  return {
    CSSProcessor: jest.fn().mockImplementation(() => ({
      convertTailwindToCSS: jest.fn(),
      clearCache: jest.fn(),
      getCacheStats: jest.fn(() => ({ size: 0, maxSize: 50 })),
    })),
  };
});

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('Tailwind to CSS Converter - Integration Tests', () => {
  let mockProcessor: jest.Mocked<any>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { CSSProcessor } = require('@/services/cssProcessor');
    mockProcessor = new CSSProcessor();
    jest.clearAllMocks();
  });

  describe('Complete conversion flow', () => {
    it('should convert Tailwind classes to CSS end-to-end', async () => {
      const mockCSS = `.element {
  background-color: rgb(59, 130, 246);
  color: rgb(255, 255, 255);
  padding: 16px;
}`;

      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' }) // Initial empty call
        .mockResolvedValueOnce({ css: mockCSS }); // User input

      render(<TailwindConverter />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
      });

      // Enter Tailwind classes
      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'bg-blue-500 text-white p-4');

      // Wait for conversion
      await waitFor(() => {
        expect(screen.getByText('.element {')).toBeInTheDocument();
      });

      expect(screen.getByText('background-color')).toBeInTheDocument();
      expect(screen.getByText(': rgb(59, 130, 246);')).toBeInTheDocument();
    });

    it('should handle real-time updates as user types', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' }) // Initial
        .mockResolvedValueOnce({ css: '.element {\n  background-color: rgb(59, 130, 246);\n}' }) // bg-blue-500
        .mockResolvedValueOnce({ css: '.element {\n  background-color: rgb(239, 68, 68);\n}' }); // bg-red-500

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');

      // Type first class
      await userEvent.type(input, 'bg-blue-500');
      await waitFor(() => {
        expect(screen.getByText(': rgb(59, 130, 246);')).toBeInTheDocument();
      });

      // Clear and type different class
      await userEvent.clear(input);
      await userEvent.type(input, 'bg-red-500');
      await waitFor(() => {
        expect(screen.getByText(': rgb(239, 68, 68);')).toBeInTheDocument();
      });
    });

    it('should copy CSS to clipboard', async () => {
      const mockCSS = '.element {\n  color: rgb(59, 130, 246);\n}';
      
      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' })
        .mockResolvedValueOnce({ css: mockCSS });

      mockWriteText.mockResolvedValueOnce(undefined);

      render(<TailwindConverter />);

      // Enter classes to generate CSS
      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'text-blue-500');

      // Wait for CSS to appear
      await waitFor(() => {
        expect(screen.getByText('.element {')).toBeInTheDocument();
      });

      // Click copy button
      const copyButton = screen.getByText('Copy');
      await userEvent.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(mockCSS);
      
      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling integration', () => {
    it('should display conversion errors to user', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' })
        .mockResolvedValueOnce({ 
          css: '', 
          error: 'Invalid Tailwind class detected' 
        });

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'invalid-class');

      await waitFor(() => {
        expect(screen.getByText('Conversion Error')).toBeInTheDocument();
        expect(screen.getByText('Invalid Tailwind class detected')).toBeInTheDocument();
      });
    });

    it('should display warnings to user', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' })
        .mockResolvedValueOnce({ 
          css: '.element {\n  color: red;\n}',
          warnings: ['Potentially invalid classes: unknown-class']
        });

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'text-red-500 unknown-class');

      await waitFor(() => {
        expect(screen.getByText('Warnings')).toBeInTheDocument();
        expect(screen.getByText('• Potentially invalid classes: unknown-class')).toBeInTheDocument();
      });
    });

    it('should recover from errors when valid input is provided', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' }) // Initial
        .mockResolvedValueOnce({ css: '', error: 'Invalid class' }) // Error
        .mockResolvedValueOnce({ css: '.element {\n  color: blue;\n}' }); // Recovery

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      
      // Enter invalid class
      await userEvent.type(input, 'invalid');
      await waitFor(() => {
        expect(screen.getByText('Conversion Error')).toBeInTheDocument();
      });

      // Clear and enter valid class
      await userEvent.clear(input);
      await userEvent.type(input, 'text-blue-500');
      
      await waitFor(() => {
        expect(screen.queryByText('Conversion Error')).not.toBeInTheDocument();
        expect(screen.getByText('.element {')).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading state during conversion', async () => {
      let resolveConversion: (value: any) => void;
      const conversionPromise = new Promise(resolve => {
        resolveConversion = resolve;
      });

      mockProcessor.convertTailwindToCSS
        .mockResolvedValueOnce({ css: '' })
        .mockReturnValueOnce(conversionPromise);

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, 'bg-blue-500');

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Converting Tailwind classes...')).toBeInTheDocument();
      });

      // Resolve conversion
      resolveConversion!({ css: '.element { background: blue; }' });

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByText('Converting Tailwind classes...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive behavior', () => {
    it('should handle character count limits', async () => {
      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      
      // Should show character count
      expect(screen.getByText('0/10000')).toBeInTheDocument();

      await userEvent.type(input, 'bg-blue-500');
      expect(screen.getByText('11/10000')).toBeInTheDocument();
    });

    it('should provide quick examples', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValue({ css: '.element { background: blue; }' });

      render(<TailwindConverter />);

      // Should show example buttons
      expect(screen.getByText('bg-blue-500 text-white p-4 rounded')).toBeInTheDocument();
      expect(screen.getByText('flex items-center justify-center')).toBeInTheDocument();

      // Clicking example should populate input
      const exampleButton = screen.getByText('bg-blue-500 text-white p-4 rounded');
      await userEvent.click(exampleButton);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      expect(input).toHaveValue('bg-blue-500 text-white p-4 rounded');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      render(<TailwindConverter />);

      // Check for proper headings
      expect(screen.getByRole('heading', { name: /tailwind to css converter/i })).toBeInTheDocument();
      
      // Check for proper sections
      expect(screen.getByLabelText('Tailwind CSS classes input')).toBeInTheDocument();
      
      // Check for proper button labels
      const copyButtons = screen.queryAllByText('Copy');
      copyButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValue({ css: '.element { color: blue; }' });

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      
      // Should be focusable
      input.focus();
      expect(input).toHaveFocus();

      // Should accept keyboard input
      await userEvent.type(input, 'text-blue-500');
      expect(input).toHaveValue('text-blue-500');
    });
  });

  describe('Edge cases and robustness', () => {
    it('should handle empty input gracefully', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValue({ css: '' });

      render(<TailwindConverter />);

      // Should show empty state message
      expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
      expect(screen.getByText('Enter some Tailwind classes to get started')).toBeInTheDocument();
    });

    it('should handle very long input', async () => {
      const longInput = 'bg-blue-500 '.repeat(1000);
      
      mockProcessor.convertTailwindToCSS
        .mockResolvedValue({ css: '.element { background: blue; }' });

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      await userEvent.type(input, longInput);

      // Should handle without crashing
      expect(input).toHaveValue(longInput);
    });

    it('should handle rapid input changes', async () => {
      mockProcessor.convertTailwindToCSS
        .mockResolvedValue({ css: '.element { color: blue; }' });

      render(<TailwindConverter />);

      const input = screen.getByLabelText('Tailwind CSS classes input');
      
      // Rapid typing
      await userEvent.type(input, 'bg-blue-500');
      await userEvent.type(input, ' text-white');
      await userEvent.type(input, ' p-4');

      // Should handle all changes
      expect(input).toHaveValue('bg-blue-500 text-white p-4');
    });
  });

  describe('Feature completeness', () => {
    it('should display all main UI elements', () => {
      render(<TailwindConverter />);

      // Header
      expect(screen.getByText('Tailwind to CSS Converter')).toBeInTheDocument();
      expect(screen.getByText(/Convert Tailwind CSS utility classes/)).toBeInTheDocument();

      // Input section
      expect(screen.getByText('Tailwind Classes')).toBeInTheDocument();
      expect(screen.getByLabelText('Tailwind CSS classes input')).toBeInTheDocument();

      // Output section
      expect(screen.getByText('Generated CSS')).toBeInTheDocument();

      // Info section
      expect(screen.getByText('Real-time Conversion')).toBeInTheDocument();
      expect(screen.getByText('Copy & Use')).toBeInTheDocument();
      expect(screen.getByText('Learn & Debug')).toBeInTheDocument();
    });

    it('should handle all supported Tailwind class types', async () => {
      const testCases = [
        { input: 'bg-blue-500', css: '.element {\n  background-color: rgb(59, 130, 246);\n}' },
        { input: 'text-lg', css: '.element {\n  font-size: 18px;\n}' },
        { input: 'p-4', css: '.element {\n  padding: 16px;\n}' },
        { input: 'flex', css: '.element {\n  display: flex;\n}' },
        { input: 'hover:bg-red-500', css: '.element:hover {\n  background-color: rgb(239, 68, 68);\n}' },
      ];

      for (const testCase of testCases) {
        mockProcessor.convertTailwindToCSS
          .mockResolvedValueOnce({ css: testCase.css });

        render(<TailwindConverter />);

        const input = screen.getByLabelText('Tailwind CSS classes input');
        await userEvent.clear(input);
        await userEvent.type(input, testCase.input);

        await waitFor(() => {
          expect(screen.getByText('.element {')).toBeInTheDocument();
        });
      }
    });
  });
});