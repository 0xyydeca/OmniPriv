'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { copyToClipboard } from '@/lib/clipboard';
import { useToast } from './Toast';

interface CopyButtonProps {
  text: string;
  label?: string;
  successMessage?: string;
  className?: string;
}

export function CopyButton({ text, label, successMessage = 'Copied to clipboard!', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    
    if (success) {
      setCopied(true);
      showToast(successMessage, 'success');
      
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-gray-700 hover:bg-gray-600 active:bg-gray-800
        text-gray-300 hover:text-white
        text-xs font-medium transition-all
        ${className}
      `}
      title={label || 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4 text-green-400" />
          Copied!
        </>
      ) : (
        <>
          <DocumentDuplicateIcon className="w-4 h-4" />
          {label || 'Copy'}
        </>
      )}
    </button>
  );
}

