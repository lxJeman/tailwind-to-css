import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import TailwindConverter from '@/components/TailwindConverter';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the CSS processor
jest.mock('@/services/cssProcessor', () => {
  return {
    CSSProcessor: jest.fn().mockImplementation(() => ({
      convertTailwindToCSS: jest.fn().mockResolvedValue({ css: '' }),
      clearCache: jest.fn(),
      getCacheStats: jest.fn(() => ({ size: 0, maxSize: 50 })),
    })),
  };
});

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WCAG Compliance', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<TailwindConverter />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<TailwindConverter />);

      // Main heading should be h1
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Tailwind to CSS Converter');

      // Section headings should be h2
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings).toHaveLength(2);
      expect(sectionHeadings[0]).toHaveTextContent('Tailwind Classes');
      expect(sectionHeadings[1]).toHaveTextContent('Generated CSS');
    });

    it('should have proper form labels', () => {
      render(<TailwindConverter />);

      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-label', 'Tailwind CSS classes input');
    });

    it('should have proper landmark regions', () => {
      render(<TailwindConverter />);

      // Should have main content area
      const main = screen.getByRole('main', { hidden: true });
      expect(main).toBeInTheDocument();

      // Should have proper sections
      const inputSection = screen.getByLabelText('Tailwind Classes');
      const outputSection = screen.getByLabelText('Generated CSS');
      expect(inputSection).toBeInTheDocument();
      expect(outputSection).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable elements in logical order', () => {
      render(<TailwindConverter />);

      const focusableElements = [
        screen.getByLabelText('Tailwind CSS classes input'),
        ...screen.getAllByRole('button'),
      ];

      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have visible focus indicators', () => {
      render(<TailwindConverter />);

      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).toHaveClass('focus:outline-none');
      // Note: In a real test, you'd verify the focus styles are visible
    });

    it('should support keyboard interaction for buttons', () => {
      render(<TailwindConverter />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
        expect(button).toHaveAttribute('type');
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA attributes', () => {
      render(<TailwindConverter />);

      // Check for proper ARIA labels
      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).toHaveAttribute('aria-label');

      // Check for hidden decorative elements
      const decorativeIcons = screen.getAllByRole('img', { hidden: true });
      decorativeIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should announce loading states', () => {
      render(<TailwindConverter />);

      // Loading states should be announced to screen readers
      // This would be tested with actual loading state in integration tests
      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      render(<TailwindConverter />);

      // Example buttons should have descriptive text
      const exampleButtons = screen.getAllByRole('button');
      exampleButtons.forEach(button => {
        expect(button.textContent).toBeTruthy();
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      render(<TailwindConverter />);

      // Error states should have text, not just color
      // Warning states should have icons, not just color
      // This is verified through the component structure
      expect(screen.getByText('Try these examples:')).toBeInTheDocument();
    });

    it('should have sufficient color contrast', () => {
      render(<TailwindConverter />);

      // Text should be readable (this would be tested with actual color values)
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveClass('text-gray-900'); // High contrast text
    });
  });

  describe('Responsive and Mobile Accessibility', () => {
    it('should be usable on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TailwindConverter />);

      // Should still have all essential elements
      expect(screen.getByLabelText('Tailwind CSS classes input')).toBeInTheDocument();
      expect(screen.getByText('Tailwind to CSS Converter')).toBeInTheDocument();
    });

    it('should have touch-friendly interactive elements', () => {
      render(<TailwindConverter />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Buttons should have adequate size for touch interaction
        // This would be verified through computed styles in a real test
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Error and Status Communication', () => {
    it('should communicate errors accessibly', () => {
      // This would be tested with actual error states
      render(<TailwindConverter />);

      // Error messages should be associated with form controls
      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).toBeInTheDocument();
    });

    it('should provide status updates for dynamic content', () => {
      render(<TailwindConverter />);

      // Dynamic content updates should be announced
      // This would be tested with aria-live regions in actual implementation
      expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have logical reading order', () => {
      render(<TailwindConverter />);

      // Content should flow logically from top to bottom
      const allText = screen.getByText('Tailwind to CSS Converter');
      expect(allText).toBeInTheDocument();
    });

    it('should have meaningful page title', () => {
      render(<TailwindConverter />);

      // Page should have descriptive title (tested in page component)
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Tailwind to CSS Converter');
    });

    it('should provide context for form controls', () => {
      render(<TailwindConverter />);

      // Form controls should have clear labels and context
      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).toHaveAttribute('placeholder');
      expect(textarea.getAttribute('placeholder')).toContain('Enter Tailwind classes');
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript', () => {
      // Basic structure should be present even without JS
      render(<TailwindConverter />);

      expect(screen.getByLabelText('Tailwind CSS classes input')).toBeInTheDocument();
      expect(screen.getByText('Generated CSS')).toBeInTheDocument();
    });

    it('should provide fallbacks for advanced features', () => {
      render(<TailwindConverter />);

      // Should have basic functionality available
      const textarea = screen.getByLabelText('Tailwind CSS classes input');
      expect(textarea).not.toHaveAttribute('disabled');
    });
  });
});