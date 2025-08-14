import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OutputPanel from '../OutputPanel';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('OutputPanel', () => {
  const defaultProps = {
    value: '',
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('shows empty state when no value provided', () => {
    render(<OutputPanel {...defaultProps} />);
    
    expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
    expect(screen.getByText('Enter some Tailwind classes to get started')).toBeInTheDocument();
  });

  it('shows empty state for "No styles generated" message', () => {
    render(<OutputPanel {...defaultProps} value="/* No styles generated */" />);
    
    expect(screen.getByText('CSS output will appear here')).toBeInTheDocument();
  });

  it('displays CSS content with syntax highlighting', () => {
    const cssValue = `.element {
  color: rgb(239, 68, 68);
  font-size: 16px;
}`;
    
    render(<OutputPanel {...defaultProps} value={cssValue} />);
    
    expect(screen.getByText('.element {')).toBeInTheDocument();
    expect(screen.getByText('color')).toBeInTheDocument();
    expect(screen.getByText(': rgb(239, 68, 68);')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<OutputPanel {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Converting Tailwind classes...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // spinner
  });

  it('shows error state', () => {
    render(<OutputPanel {...defaultProps} error="Something went wrong" />);
    
    expect(screen.getByText('Conversion Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows copy button when content is available', () => {
    const cssValue = `.element {
  color: rgb(239, 68, 68);
}`;
    
    render(<OutputPanel {...defaultProps} value={cssValue} />);
    
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('does not show copy button for empty content', () => {
    render(<OutputPanel {...defaultProps} value="" />);
    
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });

  it('copies CSS to clipboard when copy button is clicked', async () => {
    const cssValue = `.element {
  color: rgb(239, 68, 68);
}`;
    
    mockWriteText.mockResolvedValueOnce(undefined);
    
    render(<OutputPanel {...defaultProps} value={cssValue} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    expect(mockWriteText).toHaveBeenCalledWith(cssValue);
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('shows copy success state temporarily', async () => {
    const cssValue = `.element { color: red; }`;
    mockWriteText.mockResolvedValueOnce(undefined);
    
    render(<OutputPanel {...defaultProps} value={cssValue} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
    
    // Should revert back to "Copy" after timeout
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles clipboard copy failure gracefully', async () => {
    const cssValue = `.element { color: red; }`;
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
    
    render(<OutputPanel {...defaultProps} value={cssValue} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to copy CSS:', expect.any(Error));
    });
    
    // Should still show "Copy" button
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  describe('CSS syntax highlighting', () => {
    it('highlights CSS selectors', () => {
      const cssValue = `.element {
  color: red;
}`;
      
      render(<OutputPanel {...defaultProps} value={cssValue} />);
      
      const selector = screen.getByText('.element {');
      expect(selector).toHaveClass('text-blue-600', 'font-medium');
    });

    it('highlights CSS properties and values', () => {
      const cssValue = `.element {
  color: rgb(255, 0, 0);
}`;
      
      render(<OutputPanel {...defaultProps} value={cssValue} />);
      
      expect(screen.getByText('color')).toHaveClass('text-purple-600');
      expect(screen.getByText(': rgb(255, 0, 0);')).toHaveClass('text-green-600');
    });

    it('highlights CSS comments', () => {
      const cssValue = `/* This is a comment */
.element {
  color: red;
}`;
      
      render(<OutputPanel {...defaultProps} value={cssValue} />);
      
      const comment = screen.getByText('/* This is a comment */');
      expect(comment).toHaveClass('text-gray-500', 'italic');
    });
  });

  it('has proper accessibility for loading state', () => {
    render(<OutputPanel {...defaultProps} isLoading={true} />);
    
    // Should have proper loading indicators
    expect(screen.getByText('Converting Tailwind classes...')).toBeInTheDocument();
  });

  it('has proper accessibility for error state', () => {
    render(<OutputPanel {...defaultProps} error="Test error" />);
    
    expect(screen.getByText('Conversion Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});