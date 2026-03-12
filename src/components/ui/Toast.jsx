'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'bg-green-600/90 border-green-500/50 text-white',
  error: 'bg-red-600/90 border-red-500/50 text-white',
  warning: 'bg-yellow-600/90 border-yellow-500/50 text-white',
};

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || AlertCircle;
  const style = STYLES[toast.type] || STYLES.error;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-start gap-2 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-200 ${style}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
