'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({ message, resolve, ...options });
    });
  }, []);

  const handleClose = (result) => {
    state?.resolve(result);
    setState(null);
  };

  useEffect(() => {
    if (!state) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => handleClose(false)} />
          <div className="relative bg-[#1a1a2e] border border-white/15 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 fade-in duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-full shrink-0 ${state.destructive ? 'bg-red-500/20' : 'bg-primary/20'}`}>
                <AlertTriangle className={`w-5 h-5 ${state.destructive ? 'text-red-400' : 'text-primary'}`} />
              </div>
              <div>
                {state.title && <h3 className="text-white font-semibold mb-1">{state.title}</h3>}
                <p className="text-white/70 text-sm leading-relaxed">{state.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => handleClose(false)}
                variant="outline"
                className="border-white/20 text-white/70 hover:bg-white/10 text-sm"
              >
                {state.cancelText || 'Cancel'}
              </Button>
              <Button
                onClick={() => handleClose(true)}
                className={`text-sm font-semibold ${
                  state.destructive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {state.confirmText || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
