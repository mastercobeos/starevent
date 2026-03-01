import { useRef, useCallback } from 'react';

/**
 * Hook for touch swipe detection on carousels.
 * @param {function} onSwipeLeft - Called when user swipes left (next)
 * @param {function} onSwipeRight - Called when user swipes right (previous)
 * @param {number} [threshold=50] - Minimum swipe distance in px
 */
export function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    const deltaX = e.changedTouches[0].clientX - startX.current;
    const deltaY = e.changedTouches[0].clientY - startY.current;
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}
