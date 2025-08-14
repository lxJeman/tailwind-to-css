import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TailwindConverter from '../TailwindConverter';
import { CSSProcessor } from '@/services/cssProcessor';

// Mock the CSSProcessor
jest.mock('@/services/cssProcessor');
const MockedCSSProcessor = CSSProcessor as jest.MockedClass<typeof CSSProcessor>;

// Mock the child components
jest.mock('../InputPanel', () => {
  return function MockInputPanel({ value, onChange, placeholder }: any) {
    return (
      <div data-testid="input-panel">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid="input-textarea"
        />
      </div>
    );
  };
});

jest.mock('../OutputPanel', () => {
  return function MockOutputPanel({ value, isLoading, error }: any) {
    return (
      <div data-testid="output-panel">
        {isLoading && <div data-testid="loading">Loading...</div>}
        {error && <div data-testid="error">{error}</div>}
        {!isLoading && !error && <div data-testid="output">{value}</div>}
      </div>
    );
  };
});

describe('TailwindConverter', () => {
  let mockProcessor: jest.Mocked<CSSProcessor>;

  beforeEach(() => {
    mockProcessor = {
      convertTailwindToCSS: jest.fn(),
    } as any;
    MockedCSSProcessor.mockImplementation(() => mockProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main interface', () => {
    mockProcessor.convertTailwindToCSS.mockResolvedValue({ css: '' });
    
    render(<TailwindConverter />);
    
    expect(screen.getByText('Tailwind to CSS Converter')).toBeInTheDocument();
    expect(screen.getByText('Tailwind Classes')).toBeInTheDocument();
    expect(screen.getByText('Generated CSS')).toBeInTheDocument();
    expect(screen.getByTestId('input-panel')).toBeInTheDocument();
    expect(screen.getByTestId('output-panel')).toBeInTheDocument();
  });

  it('initializes with empty conversion', async () => {
    mockProcessor.convertTailwindToCSS.mockResolvedValue({ css: '' });
    
    render(<TailwindConverter />);
    
    await waitFor(() => {
      expect(mockProcessor.convertTailwindToCSS).toHaveBeenCalledWith('');
    });
  });

  it('converts Tailwind classes when input changes', async () => {
    const mockCSS = '.element {\n  color: rgb(239, 68, 68);\n}';
    mockProcessor.convertTailwindToCSS
      .mockResolvedValueOnce({ css: '' }) // Initial call
      .mockResolvedValueOnce({ css: mockCSS }); // Input change call
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    fireEvent.change(input, { target: { value: 'text-red-500' } });
    
    await waitFor(() => {
      expect(mockProcessor.convertTailwindToCSS).toHaveBeenCalledWith('text-red-500');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('output')).toHaveTextContent(mockCSS);
    });
  });

  it('shows loading state during conversion', async () => {
    let resolveConversion: (value: any) => void;
    const conversionPromise = new Promise(resolve => {
      resolveConversion = resolve;
    });
    
    mockProcessor.convertTailwindToCSS
      .mockResolvedValueOnce({ css: '' }) // Initial call
      .mockReturnValueOnce(conversionPromise as any); // Input change call
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    fireEvent.change(input, { target: { value: 'text-red-500' } });
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
    
    // Resolve the conversion
    resolveConversion!({ css: '.element { color: red; }' });
    
    // Loading should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('handles conversion errors', async () => {
    mockProcessor.convertTailwindToCSS
      .mockResolvedValueOnce({ css: '' }) // Initial call
      .mockResolvedValueOnce({ css: '', error: 'Invalid class' }); // Error case
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    fireEvent.change(input, { target: { value: 'invalid-class' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid class');
    });
  });

  it('handles processor exceptions', async () => {
    mockProcessor.convertTailwindToCSS
      .mockResolvedValueOnce({ css: '' }) // Initial call
      .mockRejectedValueOnce(new Error('Processor error')); // Exception case
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    fireEvent.change(input, { target: { value: 'text-red-500' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Processor error');
    });
  });

  it('handles unknown exceptions', async () => {
    mockProcessor.convertTailwindToCSS
      .mockResolvedValueOnce({ css: '' }) // Initial call
      .mockRejectedValueOnce('String error'); // Non-Error exception
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    fireEvent.change(input, { target: { value: 'text-red-500' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('An unexpected error occurred');
    });
  });

  it('clears error when new input is processed successfully', async () => {
    mockProcessor.convertTailwindToCSS
      .mockResolvedValueOnce({ css: '' }) // Initial call
      .mockResolvedValueOnce({ css: '', error: 'Error' }) // First input with error
      .mockResolvedValueOnce({ css: '.element { color: red; }' }); // Second input success
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    
    // First input with error
    fireEvent.change(input, { target: { value: 'invalid' } });
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
    
    // Second input without error
    fireEvent.change(input, { target: { value: 'text-red-500' } });
    await waitFor(() => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
      expect(screen.getByTestId('output')).toHaveTextContent('.element { color: red; }');
    });
  });

  it('passes correct props to InputPanel', () => {
    mockProcessor.convertTailwindToCSS.mockResolvedValue({ css: '' });
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    expect(input).toHaveAttribute('placeholder', expect.stringContaining('Enter Tailwind classes here'));
  });

  it('renders info section with features', () => {
    mockProcessor.convertTailwindToCSS.mockResolvedValue({ css: '' });
    
    render(<TailwindConverter />);
    
    expect(screen.getByText('Real-time Conversion')).toBeInTheDocument();
    expect(screen.getByText('Copy & Use')).toBeInTheDocument();
    expect(screen.getByText('Learn & Debug')).toBeInTheDocument();
  });

  it('maintains input value in state', async () => {
    mockProcessor.convertTailwindToCSS.mockResolvedValue({ css: '' });
    
    render(<TailwindConverter />);
    
    const input = screen.getByTestId('input-textarea');
    fireEvent.change(input, { target: { value: 'bg-blue-500' } });
    
    expect(input).toHaveValue('bg-blue-500');
  });
});