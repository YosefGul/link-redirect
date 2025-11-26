'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl border-2 font-semibold transition-all duration-200 ${
        copied
          ? 'bg-green-100 border-green-300 text-green-700 scale-105 shadow-lg'
          : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:scale-105 hover:shadow-md'
      } ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 animate-scale-in" />
          <span className="animate-scale-in">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
}

