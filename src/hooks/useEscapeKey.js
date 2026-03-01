import { useEffect } from 'react';

/**
 * Listens for Escape key and calls onEscape when active.
 * @param {boolean} isActive - Whether to listen for Escape
 * @param {function} onEscape - Callback when Escape is pressed
 */
export function useEscapeKey(isActive, onEscape) {
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape]);
}
