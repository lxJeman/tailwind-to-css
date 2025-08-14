import { ConversionResult, ProcessorConfig } from '@/types/converter';

// Simple LRU Cache implementation
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export class CSSProcessor {
  private config: ProcessorConfig;
  private cache: LRUCache<string, ConversionResult>;

  constructor(config: ProcessorConfig = {
    debounceMs: 300,
    maxInputLength: 10000,
    enableSyntaxHighlighting: true,
  }) {
    this.config = config;
    this.cache = new LRUCache<string, ConversionResult>(50); // Cache up to 50 results
  }

  /**
   * Convert Tailwind classes to CSS
   */
  async convertTailwindToCSS(classes: string): Promise<ConversionResult> {
    try {
      // Input validation
      if (!classes.trim()) {
        return { css: '' };
      }

      if (classes.length > this.config.maxInputLength) {
        return {
          css: '',
          error: `Input too long. Maximum ${this.config.maxInputLength} characters allowed.`,
        };
      }

      // Check cache first
      const cacheKey = classes.trim();
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Validate and sanitize input
      const validationResult = this.validateInput(classes);
      if (validationResult.error) {
        return validationResult;
      }

      const sanitizedClasses = this.sanitizeInput(classes);

      // Create virtual element and extract styles
      const element = this.createVirtualElement(sanitizedClasses);
      const computedStyles = this.extractComputedStyles(element);
      const css = this.formatCSS(computedStyles);
      
      // Cleanup
      this.cleanupVirtualElement(element);

      // Check if any meaningful styles were generated
      const warnings = this.generateWarnings(sanitizedClasses, css);

      const result = { 
        css,
        warnings: warnings.length > 0 ? warnings : undefined
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      return {
        css: '',
        error: this.formatError(error),
      };
    }
  }

  /**
   * Create a virtual DOM element with Tailwind classes
   */
  private createVirtualElement(classes: string): HTMLElement {
    const element = document.createElement('div');
    element.className = classes;
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.pointerEvents = 'none';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    
    document.body.appendChild(element);
    return element;
  }

  /**
   * Extract computed styles from an element
   */
  private extractComputedStyles(element: HTMLElement): CSSStyleDeclaration {
    return window.getComputedStyle(element);
  }

  /**
   * Format CSS styles into readable CSS code
   */
  private formatCSS(styles: CSSStyleDeclaration): string {
    const cssRules: string[] = [];
    const relevantProperties = this.getRelevantCSSProperties(styles);

    for (const property of relevantProperties) {
      const value = styles.getPropertyValue(property);
      if (value && this.isNonDefaultValue(property, value)) {
        cssRules.push(`  ${property}: ${value};`);
      }
    }

    if (cssRules.length === 0) {
      return '/* No styles generated - try adding some Tailwind classes */';
    }

    return `.element {\n${cssRules.sort().join('\n')}\n}`;
  }

  /**
   * Get relevant CSS properties to include in output
   */
  private getRelevantCSSProperties(styles: CSSStyleDeclaration): string[] {
    const relevantProps = [
      // Layout
      'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
      
      // Box Model
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border', 'border-width', 'border-style', 'border-color',
      'border-radius', 'box-sizing',
      
      // Typography
      'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
      'text-align', 'text-decoration', 'text-transform', 'letter-spacing',
      'word-spacing', 'white-space',
      
      // Colors
      'color', 'background-color', 'background-image', 'background-size',
      'background-position', 'background-repeat', 'opacity',
      
      // Flexbox
      'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
      'align-content', 'flex-grow', 'flex-shrink', 'flex-basis',
      
      // Grid
      'grid-template-columns', 'grid-template-rows', 'grid-gap', 'grid-column',
      'grid-row', 'grid-area',
      
      // Transform & Animation
      'transform', 'transition', 'animation',
    ];

    return relevantProps.filter(prop => styles.getPropertyValue(prop));
  }

  /**
   * Check if a CSS value is non-default and should be included
   */
  private isNonDefaultValue(property: string, value: string): boolean {
    // Skip empty or initial values
    if (!value || value === 'initial' || value === 'inherit' || value === 'unset') {
      return false;
    }

    const defaultValues: Record<string, string[]> = {
      'margin': ['0px', '0'],
      'margin-top': ['0px', '0'],
      'margin-right': ['0px', '0'],
      'margin-bottom': ['0px', '0'],
      'margin-left': ['0px', '0'],
      'padding': ['0px', '0'],
      'padding-top': ['0px', '0'],
      'padding-right': ['0px', '0'],
      'padding-bottom': ['0px', '0'],
      'padding-left': ['0px', '0'],
      'border-width': ['0px', '0'],
      'opacity': ['1'],
      'font-weight': ['400', 'normal'],
      'line-height': ['normal'],
      'text-decoration': ['none'],
      'background-color': ['rgba(0, 0, 0, 0)', 'transparent'],
      'color': ['rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)'],
      'display': ['block', 'inline'],
      'position': ['static'],
      'z-index': ['auto'],
      'overflow': ['visible'],
      'text-align': ['start', 'left'],
      'font-style': ['normal'],
      'text-transform': ['none'],
      'white-space': ['normal'],
    };

    const defaults = defaultValues[property];
    return !defaults || !defaults.includes(value);
  }

  /**
   * Clean up virtual element
   */
  private cleanupVirtualElement(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Validate input for potential issues
   */
  private validateInput(classes: string): ConversionResult {
    // Check for potentially malicious content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(classes)) {
        return {
          css: '',
          error: 'Input contains potentially unsafe content. Please use only Tailwind CSS classes.',
        };
      }
    }

    // Check for excessive special characters
    const specialCharCount = (classes.match(/[<>{}()[\]]/g) || []).length;
    if (specialCharCount > 10) {
      return {
        css: '',
        error: 'Input contains too many special characters. Please use valid Tailwind CSS classes.',
      };
    }

    return { css: '' }; // No validation errors
  }

  /**
   * Sanitize input by removing potentially harmful content
   */
  private sanitizeInput(classes: string): string {
    return classes
      .replace(/[<>{}()[\]]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate warnings for common issues
   */
  private generateWarnings(classes: string, css: string): string[] {
    const warnings: string[] = [];
    const classArray = classes.split(/\s+/).filter(Boolean);

    // Check for potentially invalid classes
    const invalidClasses = classArray.filter(cls => {
      // Very basic check for Tailwind-like patterns
      return !cls.match(/^[a-z-]+(\d+|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)?(\/(10|20|25|30|40|50|60|70|75|80|90|95|100))?$/i) &&
             !cls.match(/^(hover|focus|active|disabled|first|last|odd|even|group-hover|group-focus):/i) &&
             !cls.match(/^(sm|md|lg|xl|2xl):/i) &&
             !cls.match(/^[a-z-]+\[.+\]$/i); // Arbitrary values
    });

    if (invalidClasses.length > 0 && invalidClasses.length <= 3) {
      warnings.push(`Potentially invalid classes: ${invalidClasses.join(', ')}`);
    } else if (invalidClasses.length > 3) {
      warnings.push(`${invalidClasses.length} potentially invalid classes detected`);
    }

    // Check if no meaningful styles were generated
    if (css.includes('No styles generated') && classArray.length > 0) {
      warnings.push('No CSS styles were generated. Check if the classes are valid Tailwind utilities.');
    }

    // Check for very long class names (might be typos)
    const longClasses = classArray.filter(cls => cls.length > 30);
    if (longClasses.length > 0) {
      warnings.push('Some class names are unusually long. Please verify they are correct.');
    }

    return warnings;
  }

  /**
   * Format error messages for better user experience
   */
  private formatError(error: unknown): string {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'SecurityError') {
        return 'Security error: Unable to access computed styles. This might be due to browser security restrictions.';
      }
      
      if (error.message.includes('DOM')) {
        return 'DOM error: Unable to create virtual element for style computation.';
      }

      if (error.message.includes('getComputedStyle')) {
        return 'Style computation error: Unable to extract CSS styles from the element.';
      }

      return error.message;
    }

    return 'An unexpected error occurred during CSS conversion.';
  }

  /**
   * Clear the conversion cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: 50,
    };
  }
}