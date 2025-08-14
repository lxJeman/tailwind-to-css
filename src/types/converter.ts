/**
 * Core interfaces for the Tailwind to CSS converter
 */

export interface ConversionResult {
  css: string;
  error?: string;
  warnings?: string[];
}

export interface ProcessorConfig {
  debounceMs: number;
  maxInputLength: number;
  enableSyntaxHighlighting: boolean;
}

export interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export interface OutputPanelProps {
  value: string;
  isLoading: boolean;
  error: string | null;
  warnings?: string[];
}

export interface TailwindConverterState {
  inputValue: string;
  outputValue: string;
  isProcessing: boolean;
  error: string | null;
  warnings: string[];
}