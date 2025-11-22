'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op implementation if used outside provider (SSR safety)
    return {
      showToast: (message: string, type: ToastType = 'info') => {
        console.log('[Toast]', type, message);
      }
    };
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-2xl border-2
              min-w-[300px] max-w-md
              animate-slide-in-right
              ${toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : ''}
              ${toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' : ''}
              ${toast.type === 'info' ? 'bg-blue-900/90 border-blue-500 text-blue-100' : ''}
              backdrop-blur-sm
            `}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-400" />}
              {toast.type === 'error' && <XCircleIcon className="w-6 h-6 text-red-400" />}
              {toast.type === 'info' && <InformationCircleIcon className="w-6 h-6 text-blue-400" />}
            </div>
            
            {/* Message */}
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            
            {/* Dismiss Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 hover:bg-white/10 rounded p-1 transition-colors"
              aria-label="Dismiss"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

