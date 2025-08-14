import { CSSProcessor } from '../cssProcessor';

// Mock DOM methods for testing
const mockElement = {
  className: '',
  style: {
    position: '',
    visibility: '',
    pointerEvents: '',
    top: '',
    left: '',
  },
  parentNode: {
    removeChild: jest.fn(),
  },
};

const mockComputedStyle = {
  getPropertyValue: jest.fn(),
  length: 0,
};

Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => mockElement),
    body: {
      appendChild: jest.fn(),
    },
  },
});

Object.defineProperty(global, 'window', {
  value: {
    getComputedStyle: jest.fn(() => mockComputedStyle),
  },
});

describe('CSSProcessor - Validation and Error Handling', () => {
  let processor: CSSProcessor;

  beforeEach(() => {
    processor = new CSSProcessor();
    jest.clearAllMocks();
    mockComputedStyle.getPropertyValue.mockReturnValue('');
  });

  describe('Input validation', () => {
    it('should reject input with script tags', async () => {
      const result = await processor.convertTailwindToCSS('<script>alert("xss")</script>');
      
      expect(result.css).toBe('');
      expect(result.error).toContain('potentially unsafe content');
    });

    it('should reject input with javascript: protocol', async () => {
      const result = await processor.convertTailwindToCSS('javascript:alert("xss")');
      
      expect(result.css).toBe('');
      expect(result.error).toContain('potentially unsafe content');
    });

    it('should reject input with event handlers', async () => {
      const result = await processor.convertTailwindToCSS('onclick="alert(1)"');
      
      expect(result.css).toBe('');
      expect(result.error).toContain('potentially unsafe content');
    });

    it('should reject input with excessive special characters', async () => {
      const result = await processor.convertTailwindToCSS('{}[]()<>{}[]()<>{}[]');
      
      expect(result.css).toBe('');
      expect(result.error).toContain('too many special characters');
    });

    it('should accept valid Tailwind classes', async () => {
      const result = await processor.convertTailwindToCSS('bg-blue-500 text-white p-4');
      
      expect(result.error).toBeUndefined();
    });
  });

  describe('Input sanitization', () => {
    it('should remove special characters from input', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'color') return 'rgb(59, 130, 246)';
        return '';
      });

      const result = await processor.convertTailwindToCSS('bg-blue-500{} text-white[]');
      
      expect(result.css).toContain('color: rgb(59, 130, 246)');
      expect(result.error).toBeUndefined();
    });

    it('should normalize whitespace', async () => {
      const result = await processor.convertTailwindToCSS('bg-blue-500    text-white\n\np-4');
      
      expect(result.error).toBeUndefined();
    });
  });

  describe('Warning generation', () => {
    it('should warn about potentially invalid classes', async () => {
      const result = await processor.convertTailwindToCSS('bg-blue-500 invalid-class-name');
      
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Potentially invalid classes: invalid-class-name');
    });

    it('should warn about unusually long class names', async () => {
      const longClass = 'this-is-a-very-long-class-name-that-might-be-a-typo';
      const result = await processor.convertTailwindToCSS(`bg-blue-500 ${longClass}`);
      
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('unusually long'))).toBe(true);
    });

    it('should warn when no styles are generated', async () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');
      
      const result = await processor.convertTailwindToCSS('completely-invalid-class');
      
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('No CSS styles were generated'))).toBe(true);
    });

    it('should not warn about valid Tailwind classes', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'background-color') return 'rgb(59, 130, 246)';
        return '';
      });

      const result = await processor.convertTailwindToCSS('bg-blue-500 hover:bg-blue-600 md:text-lg');
      
      expect(result.warnings).toEqual([]);
    });

    it('should handle arbitrary value syntax', async () => {
      const result = await processor.convertTailwindToCSS('bg-[#1da1f2] text-[14px]');
      
      expect(result.warnings).toEqual([]);
    });
  });

  describe('Error formatting', () => {
    it('should format SecurityError appropriately', async () => {
      const securityError = new Error('Access denied');
      securityError.name = 'SecurityError';
      
      (document.createElement as jest.Mock).mockImplementationOnce(() => {
        throw securityError;
      });

      const result = await processor.convertTailwindToCSS('bg-blue-500');
      
      expect(result.error).toContain('Security error');
      expect(result.error).toContain('browser security restrictions');
    });

    it('should format DOM errors appropriately', async () => {
      const domError = new Error('DOM manipulation failed');
      
      (document.createElement as jest.Mock).mockImplementationOnce(() => {
        throw domError;
      });

      const result = await processor.convertTailwindToCSS('bg-blue-500');
      
      expect(result.error).toContain('DOM error');
    });

    it('should format getComputedStyle errors appropriately', async () => {
      const styleError = new Error('getComputedStyle failed');
      
      (window.getComputedStyle as jest.Mock).mockImplementationOnce(() => {
        throw styleError;
      });

      const result = await processor.convertTailwindToCSS('bg-blue-500');
      
      expect(result.error).toContain('Style computation error');
    });

    it('should handle unknown error types', async () => {
      (document.createElement as jest.Mock).mockImplementationOnce(() => {
        throw 'String error';
      });

      const result = await processor.convertTailwindToCSS('bg-blue-500');
      
      expect(result.error).toBe('An unexpected error occurred during CSS conversion.');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input gracefully', async () => {
      const result = await processor.convertTailwindToCSS('');
      
      expect(result.css).toBe('');
      expect(result.error).toBeUndefined();
      expect(result.warnings).toBeUndefined();
    });

    it('should handle whitespace-only input', async () => {
      const result = await processor.convertTailwindToCSS('   \n\t  ');
      
      expect(result.css).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('should handle input at maximum length', async () => {
      const maxInput = 'a'.repeat(10000);
      const result = await processor.convertTailwindToCSS(maxInput);
      
      expect(result.error).toBeUndefined();
    });

    it('should reject input over maximum length', async () => {
      const overMaxInput = 'a'.repeat(10001);
      const result = await processor.convertTailwindToCSS(overMaxInput);
      
      expect(result.error).toContain('Input too long');
    });
  });
});