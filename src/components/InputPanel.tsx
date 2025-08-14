'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import { InputPanelProps } from '@/types/converter';

interface EnhancedInputPanelProps extends InputPanelProps {
  debounceMs?: number;
  maxLength?: number;
}

const InputPanel = memo(function InputPanel({ 
  value, 
  onChange, 
  placeholder, 
  debounceMs = 300,
  maxLength = 10000 
}: EnhancedInputPanelProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounced onChange handler
  const debouncedOnChange = useMemo(
    () => debounce((newValue: string) => {
      onChange(newValue);
    }, debounceMs),
    [onChange, debounceMs]
  );

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    if (newValue.length <= maxLength) {
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    }
  };

  const characterCount = localValue.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-full resize-none border-0 bg-transparent focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed p-4 ${
            isAtLimit ? 'text-red-600' : 'text-gray-900'
          }`}
          aria-label="Tailwind CSS classes input"
          spellCheck={false}
        />
        
        {/* Character count indicator */}
        <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${
          isAtLimit 
            ? 'bg-red-100 text-red-700' 
            : isNearLimit 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          {characterCount}/{maxLength}
        </div>
      </div>
      
      {/* Quick examples */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {quickExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleChange(example)}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              type="button"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default InputPanel;

// Debounce utility function
function debounce(
  func: (value: string) => void,
  wait: number
): (value: string) => void {
  let timeout: NodeJS.Timeout;
  return (value: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(value), wait);
  };
}

// Quick example classes for users to try
const quickExamples = [
  'bg-blue-500 text-white p-4 rounded',
  'flex items-center justify-center',
  'grid grid-cols-3 gap-4',
  'text-2xl font-bold text-gray-800',
  'shadow-lg border border-gray-200',
];