'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TailwindConverterState } from '@/types/converter';
import { CSSProcessor } from '@/services/cssProcessor';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';

export default function TailwindConverter() {
  const [state, setState] = useState<TailwindConverterState>({
    inputValue: '',
    outputValue: '',
    isProcessing: false,
    error: null,
    warnings: [],
  });

  const [processor] = useState(() => new CSSProcessor());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle input changes with conversion
  const handleInputChange = useCallback(async (newValue: string) => {
    // Cancel any pending conversion
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this conversion
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setState(prev => ({
      ...prev,
      inputValue: newValue,
      isProcessing: true,
      error: null,
      warnings: [],
    }));

    try {
      const result = await processor.convertTailwindToCSS(newValue);
      
      // Check if this conversion was cancelled
      if (currentController.signal.aborted) {
        return;
      }
      
      setState(prev => ({
        ...prev,
        outputValue: result.css,
        isProcessing: false,
        error: result.error || null,
        warnings: result.warnings || [],
      }));
    } catch (error) {
      // Check if this conversion was cancelled
      if (currentController.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        outputValue: '',
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        warnings: [],
      }));
    }
  }, [processor]);

  // Initialize with empty conversion
  useEffect(() => {
    handleInputChange('');
  }, [handleInputChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl mb-4 sm:mb-6">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Tailwind to CSS Converter
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Convert Tailwind CSS utility classes to their equivalent CSS code in real-time
          </p>
        </header>
        
        {/* Main Converter Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Input Panel */}
            <section className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden order-1" aria-labelledby="input-heading">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                <h2 id="input-heading" className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Tailwind Classes</span>
                </h2>
              </div>
              <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
                <InputPanel
                  value={state.inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter Tailwind classes here...&#10;&#10;Examples:&#10;• bg-blue-500 text-white p-4 rounded-lg&#10;• flex items-center justify-center&#10;• grid grid-cols-3 gap-4"
                  debounceMs={300}
                  maxLength={10000}
                />
              </div>
            </section>
            
            {/* Output Panel */}
            <section className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden order-2" aria-labelledby="output-heading">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4">
                <h2 id="output-heading" className="text-base sm:text-lg font-semibold text-white flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Generated CSS</span>
                </h2>
              </div>
              <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
                <OutputPanel
                  value={state.outputValue}
                  isLoading={state.isProcessing}
                  error={state.error}
                  warnings={state.warnings}
                />
              </div>
            </section>
          </div>
          
          {/* Info Section */}
          <div className="mt-8 sm:mt-12 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Real-time Conversion</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  See your Tailwind classes converted to CSS instantly as you type
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Copy & Use</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Copy the generated CSS with one click and use it in your projects
                </p>
              </div>
              
              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Learn & Debug</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Understand what CSS is generated and debug your Tailwind classes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}