'use client';

import { useState, memo } from 'react';
import { OutputPanelProps } from '@/types/converter';

const OutputPanel = memo(function OutputPanel({ value, isLoading, error, warnings }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  };

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Conversion Error</h3>
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">Converting Tailwind classes...</p>
        </div>
      </div>
    );
  }

  const hasContent = value && value.trim() && !value.includes('No styles generated');

  return (
    <div className="h-full flex flex-col">
      {/* Header with copy button and warnings */}
      {hasContent && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-gray-600">Generated CSS</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              type="button"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          
          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="px-3 pb-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Warnings</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* CSS Output */}
      <div className="flex-1 overflow-hidden">
        {!value || value.includes('No styles generated') ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-lg font-medium mb-2">CSS output will appear here</p>
              <p className="text-sm">Enter some Tailwind classes to get started</p>
            </div>
          </div>
        ) : (
          <pre className="w-full h-full overflow-auto font-mono text-sm leading-relaxed p-4">
            <SyntaxHighlightedCSS css={value} />
          </pre>
        )}
      </div>
    </div>
  );
});

export default OutputPanel;

// Simple CSS syntax highlighting component
const SyntaxHighlightedCSS = memo(function SyntaxHighlightedCSS({ css }: { css: string }) {
  // Split CSS into tokens for basic syntax highlighting
  const highlightCSS = (cssText: string) => {
    return cssText
      .split('\n')
      .map((line, lineIndex) => {
        if (line.trim().startsWith('/*') && line.trim().endsWith('*/')) {
          // Comments
          return (
            <span key={lineIndex} className="text-gray-500 italic">
              {line}
            </span>
          );
        } else if (line.includes('{') || line.includes('}')) {
          // Selectors and braces
          return (
            <span key={lineIndex} className="text-blue-600 font-medium">
              {line}
            </span>
          );
        } else if (line.includes(':')) {
          // CSS properties and values
          const [property, ...valueParts] = line.split(':');
          const value = valueParts.join(':');
          return (
            <span key={lineIndex}>
              <span className="text-purple-600">{property}</span>
              <span className="text-gray-700">:</span>
              <span className="text-green-600">{value}</span>
            </span>
          );
        } else {
          // Default
          return (
            <span key={lineIndex} className="text-gray-800">
              {line}
            </span>
          );
        }
      })
      .reduce((acc, line, index) => {
        if (index > 0) acc.push(<br key={`br-${index}`} />);
        acc.push(line);
        return acc;
      }, [] as React.ReactNode[]);
  };

  return <>{highlightCSS(css)}</>;
});