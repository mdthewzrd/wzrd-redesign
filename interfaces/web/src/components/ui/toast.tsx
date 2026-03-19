import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      removeToast(toasts[0].id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            transform transition-all duration-300
            ${toast.type === 'success' ? 'translate-x-full opacity-100' : 'translate-x-full opacity-0'}
            ${toast.type === 'error' ? 'translate-x-full opacity-0' : 'translate-x-full opacity-0'}
          `}
          style={{
            animation: `fadeIn 0.3s ease-out`
          }}
        >
          <div className="flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-card">
            <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-success' : toast.type === 'error' ? 'bg-destructive' : toast.type === 'warning' ? 'bg-warning' : 'bg-blue-500'}`}>
              {toast.type === 'success' && (
                <div className="w-4 h-4 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 21" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="8.21 3 7 14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-4 h-4 text-white">
                  <X className="w-full h-full" />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="w-4 h-4 text-white">
                  <AlertTriangle className="w-full h-full" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-6 h-6 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {toast.message}
              </p>

              {toast.action && (
                <button
                  onClick={() => {
                    toast.action.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToastActions() {
  const { addToast } = useToast();

  return {
    success: (message: string, action?: Toast['action']) => addToast({ type: 'success', message, duration: 4000, action }),
    error: (message: string) => addToast({ type: 'error', message, duration: 6000 }),
    warning: (message: string) => addToast({ type: 'warning', message, duration: 4000 }),
    info: (message: string) => addToast({ type: 'info', message, duration: 4000 }),
  };
}
