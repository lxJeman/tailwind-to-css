import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InputPanel from '../InputPanel';

// Mock timers for debounce testing
jest.useFakeTimers();

describe('InputPanel', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    placeholder: 'Enter Tailwind classes...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('renders with correct placeholder', () => {
    render(<InputPanel {...defaultProps} />);
    
    const textarea = screen.getByLabelText('Tailwind CSS classes input');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Enter Tailwind classes...');
  });

  it('displays the current value', () => {
    render(<InputPanel {...defaultProps} value="bg-blue-500" />);
    
    const textarea = screen.getByDisplayValue('bg-blue-500');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange with debounce', async () => {
    render(<InputPanel {...defaultProps} debounceMs={100} />);
    
    const textarea = screen.getByLabelText('Tailwind CSS classes input');
    fireEvent.change(textarea, { target: { value: 'text-red-500' } });
    
    // Should not call onChange immediately
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Fast-forward time to trigger debounce
    jest.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('text-red-500');
    });
  });

  it('respects maxLength limit', () => {
    render(<InputPanel {...defaultProps} maxLength={10} />);
    
    const textarea = screen.getByLabelText('Tailwind CSS classes input');
    fireEvent.change(textarea, { target: { value: 'this-is-a-very-long-class-name' } });
    
    // Should not exceed maxLength
    expect(textarea).toHaveValue('this-is-a-');
  });

  it('shows character count', () => {
    render(<InputPanel {...defaultProps} value="bg-blue-500" maxLength={100} />);
    
    expect(screen.getByText('11/100')).toBeInTheDocument();
  });

  it('shows warning when near character limit', () => {
    render(<InputPanel {...defaultProps} value={'a'.repeat(85)} maxLength={100} />);
    
    const counter = screen.getByText('85/100');
    expect(counter).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  it('shows error when at character limit', () => {
    render(<InputPanel {...defaultProps} value={'a'.repeat(100)} maxLength={100} />);
    
    const counter = screen.getByText('100/100');
    expect(counter).toHaveClass('bg-red-100', 'text-red-700');
    
    const textarea = screen.getByLabelText('Tailwind CSS classes input');
    expect(textarea).toHaveClass('text-red-600');
  });

  it('renders quick examples', () => {
    render(<InputPanel {...defaultProps} />);
    
    expect(screen.getByText('Try these examples:')).toBeInTheDocument();
    expect(screen.getByText('bg-blue-500 text-white p-4 rounded')).toBeInTheDocument();
    expect(screen.getByText('flex items-center justify-center')).toBeInTheDocument();
  });

  it('applies example when clicked', async () => {
    render(<InputPanel {...defaultProps} debounceMs={100} />);
    
    const exampleButton = screen.getByText('bg-blue-500 text-white p-4 rounded');
    fireEvent.click(exampleButton);
    
    const textarea = screen.getByLabelText('Tailwind CSS classes input');
    expect(textarea).toHaveValue('bg-blue-500 text-white p-4 rounded');
    
    // Fast-forward time to trigger debounce
    jest.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('bg-blue-500 text-white p-4 rounded');
    });
  });

  it('updates local value when external value changes', () => {
    const { rerender } = render(<InputPanel {...defaultProps} value="initial" />);
    
    let textarea = screen.getByDisplayValue('initial');
    expect(textarea).toBeInTheDocument();
    
    rerender(<InputPanel {...defaultProps} value="updated" />);
    
    textarea = screen.getByDisplayValue('updated');
    expect(textarea).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<InputPanel {...defaultProps} />);
    
    const textarea = screen.getByLabelText('Tailwind CSS classes input');
    expect(textarea).toHaveAttribute('aria-label', 'Tailwind CSS classes input');
    expect(textarea).toHaveAttribute('spellCheck', 'false');
  });
});