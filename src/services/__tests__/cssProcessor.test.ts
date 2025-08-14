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

// Mock document and window
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

describe('CSSProcessor', () => {
  let processor: CSSProcessor;

  beforeEach(() => {
    processor = new CSSProcessor();
    jest.clearAllMocks();
  });

  describe('convertTailwindToCSS', () => {
    it('should return empty CSS for empty input', async () => {
      const result = await processor.convertTailwindToCSS('');
      expect(result.css).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('should return empty CSS for whitespace-only input', async () => {
      const result = await processor.convertTailwindToCSS('   ');
      expect(result.css).toBe('');
      expect(result.error).toBeUndefined();
    });

    it('should return error for input that exceeds max length', async () => {
      const longInput = 'a'.repeat(10001);
      const result = await processor.convertTailwindToCSS(longInput);
      expect(result.css).toBe('');
      expect(result.error).toContain('Input too long');
    });

    it('should handle conversion errors gracefully', async () => {
      // Mock document.createElement to throw an error
      (document.createElement as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DOM error');
      });

      const result = await processor.convertTailwindToCSS('text-red-500');
      expect(result.css).toBe('');
      expect(result.error).toBe('DOM error');
    });

    it('should create and cleanup virtual element', async () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');
      
      await processor.convertTailwindToCSS('text-red-500');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(mockElement.parentNode.removeChild).toHaveBeenCalledWith(mockElement);
    });

    it('should format CSS with relevant properties', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'color') return 'rgb(239, 68, 68)';
        if (prop === 'font-size') return '16px';
        return '';
      });

      const result = await processor.convertTailwindToCSS('text-red-500');
      
      expect(result.css).toContain('color: rgb(239, 68, 68);');
      expect(result.css).toContain('font-size: 16px;');
      expect(result.css).toContain('.element {');
    });
  });

  describe('CSS formatting', () => {
    it('should return no styles message when no relevant properties found', async () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');
      
      const result = await processor.convertTailwindToCSS('some-class');
      expect(result.css).toContain('No styles generated');
    });

    it('should sort CSS properties alphabetically', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'z-index') return '10';
        if (prop === 'color') return 'rgb(255, 0, 0)';
        if (prop === 'margin') return '8px';
        return '';
      });

      const result = await processor.convertTailwindToCSS('test-class');
      
      const lines = result.css.split('\n');
      const propertyLines = lines.filter(line => line.includes(':')).map(line => line.trim());
      
      // Should be sorted alphabetically
      expect(propertyLines[0]).toContain('color:');
      expect(propertyLines[1]).toContain('margin:');
      expect(propertyLines[2]).toContain('z-index:');
    });
  });

  describe('default value filtering', () => {
    it('should filter out default margin values', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'margin') return '0px';
        if (prop === 'color') return 'rgb(255, 0, 0)';
        return '';
      });

      const result = await processor.convertTailwindToCSS('test-class');
      
      expect(result.css).not.toContain('margin: 0px');
      expect(result.css).toContain('color: rgb(255, 0, 0)');
    });

    it('should filter out default opacity values', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'opacity') return '1';
        if (prop === 'color') return 'rgb(255, 0, 0)';
        return '';
      });

      const result = await processor.convertTailwindToCSS('test-class');
      
      expect(result.css).not.toContain('opacity: 1');
      expect(result.css).toContain('color: rgb(255, 0, 0)');
    });
  });
});