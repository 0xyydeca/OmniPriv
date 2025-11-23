'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CopyButton } from './CopyButton';

interface DebugItem {
  label: string;
  value: string | number | boolean | undefined;
  link?: string;
}

interface DebugPanelProps {
  title?: string;
  items: DebugItem[];
  defaultOpen?: boolean;
}

export function DebugPanel({ title = 'Technical Details (for judges)', items, defaultOpen = false }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-gray-900/80">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[140px]">
                {item.label}:
              </span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-blue-400 hover:text-blue-300 hover:underline break-all"
                  >
                    {String(item.value)}
                  </a>
                ) : (
                  <span className="font-mono text-xs text-gray-300 break-all">
                    {item.value === undefined || item.value === null || item.value === '' 
                      ? 'N/A' 
                      : String(item.value)}
                  </span>
                )}
                {item.value && typeof item.value === 'string' && item.value.startsWith('0x') && (
                  <CopyButton text={item.value} className="flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

