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

describe('CSSProcessor - Performance', () => {
  let processor: CSSProcessor;

  beforeEach(() => {
    processor = new CSSProcessor();
    jest.clearAllMocks();
    mockComputedStyle.getPropertyValue.mockReturnValue('');
  });

  describe('Caching', () => {
    it('should cache conversion results', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'color') return 'rgb(59, 130, 246)';
        return '';
      });

      const classes = 'bg-blue-500 text-white';
      
      // First conversion
      const result1 = await processor.convertTailwindToCSS(classes);
      expect(document.createElement).toHaveBeenCalledTimes(1);
      
      // Second conversion should use cache
      const result2 = await processor.convertTailwindToCSS(classes);
      expect(document.createElement).toHaveBeenCalledTimes(1); // No additional DOM creation
      
      expect(result1).toEqual(result2);
    });

    it('should cache different inputs separately', async () => {
      mockComputedStyle.getPropertyValue.mockImplementation((prop: string) => {
        if (prop === 'color') return 'rgb(59, 130, 246)';
        return '';
      });

      await processor.convertTailwindToCSS('bg-blue-500');
      await processor.convertTailwindToCSS('bg-red-500');
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
    });

    it('should respect cache size limits', async () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');

      // Fill cache beyond limit (50 items)
      const promises = [];
      for (let i = 0; i < 60; i++) {
        promises.push(processor.convertTailwindToCSS(`class-${i}`));
      }
      
      await Promise.all(promises);
      
      const stats = processor.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });

    it('should clear cache when requested', async () => {
      await processor.convertTailwindToCSS('bg-blue-500');
      
      let stats = processor.getCacheStats();
      expect(stats.size).toBe(1);
      
      processor.clearCache();
      
      stats = processor.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should handle whitespace variations in cache keys', async () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');

      await processor.convertTailwindToCSS('bg-blue-500 text-white');
      await processor.convertTailwindToCSS('  bg-blue-500 text-white  ');
      
      // Should use cache for trimmed version
      expect(document.createElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory management', () => {
    it('should clean up virtual elements', async () => {
      await processor.convertTailwindToCSS('bg-blue-500');
      
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(mockElement.parentNode.removeChild).toHaveBeenCalledWith(mockElement);
    });

    it('should clean up even when errors occur', async () => {
      mockComputedStyle.getPropertyValue.mockImplementationOnce(() => {
        throw new Error('Style error');
      });

      await processor.convertTailwindToCSS('bg-blue-500');
      
      expect(mockElement.parentNode.removeChild).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('Performance characteristics', () => {
    it('should handle large inputs efficiently', async () => {
      const largeInput = Array(1000).fill('bg-blue-500').join(' ');
      
      const startTime = performance.now();
      await processor.convertTailwindToCSS(largeInput);
      const endTime = performance.now();
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });

    it('should handle many small conversions efficiently', async () => {
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(processor.convertTailwindToCSS(`bg-blue-${i % 10}00`));
      }
      
      await Promise.all(promises);
      const endTime = performance.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });

    it('should benefit from caching on repeated inputs', async () => {
      const classes = 'bg-blue-500 text-white p-4 rounded-lg';
      
      // First conversion (no cache)
      const startTime1 = performance.now();
      await processor.convertTailwindToCSS(classes);
      const endTime1 = performance.now();
      const firstTime = endTime1 - startTime1;
      
      // Second conversion (with cache)
      const startTime2 = performance.now();
      await processor.convertTailwindToCSS(classes);
      const endTime2 = performance.now();
      const secondTime = endTime2 - startTime2;
      
      // Cached version should be significantly faster
      expect(secondTime).toBeLessThan(firstTime * 0.5);
    });
  });

  describe('Cache statistics', () => {
    it('should provide accurate cache statistics', () => {
      const stats = processor.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.maxSize).toBeGreaterThan(0);
    });

    it('should update cache size correctly', async () => {
      let stats = processor.getCacheStats();
      expect(stats.size).toBe(0);
      
      await processor.convertTailwindToCSS('bg-blue-500');
      
      stats = processor.getCacheStats();
      expect(stats.size).toBe(1);
      
      await processor.convertTailwindToCSS('bg-red-500');
      
      stats = processor.getCacheStats();
      expect(stats.size).toBe(2);
    });
  });
});