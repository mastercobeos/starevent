'use client';

import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';

const SheetContext = createContext();

export function Sheet({ children, open, onOpenChange }) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ asChild, children, className = '' }) {
  const { onOpenChange } = useContext(SheetContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
      className: `${children.props.className || ''} ${className}`,
    });
  }
  
  return (
    <button
      onClick={() => onOpenChange(true)}
      className={className}
    >
      {children}
    </button>
  );
}

export function SheetContent({ 
  children, 
  side = 'right', 
  className = '' 
}) {
  const { open, onOpenChange } = useContext(SheetContext);
  
  if (!open) return null;
  
  const sideClasses = {
    right: 'right-0',
    left: 'left-0',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };
  
  const heightClass = side === 'right' || side === 'left' 
    ? 'h-auto'
    : '';
  
  const topClass = side === 'right' || side === 'left'
    ? 'top-[3.2rem] sm:top-16 md:top-[4.8rem]'
    : '';
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={() => onOpenChange(false)}
      />
      <div 
        className={`fixed ${sideClasses[side]} ${topClass} ${heightClass} z-[70] backdrop-blur-md ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 30, 55, 0.78) 50%, rgba(15, 23, 42, 0.85) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 text-white hover:text-primary transition-all duration-300 hover:scale-110 z-10 p-2 rounded-full hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
}
