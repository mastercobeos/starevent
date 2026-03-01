import { useState, useEffect } from 'react';

/**
 * Returns a responsive count based on window width breakpoints.
 * @param {Array<[number, number]>} breakpoints - Array of [maxWidth, count] pairs, checked in order. Last entry is the default.
 * @param {function} [onUpdate] - Optional callback when count changes, receives new count.
 * Example: useResponsiveCount([[640, 1], [768, 2], [Infinity, 3]])
 */
export function useResponsiveCount(breakpoints, onUpdate) {
  const getCount = () => {
    const w = window.innerWidth;
    for (const [maxWidth, count] of breakpoints) {
      if (w < maxWidth) return count;
    }
    return breakpoints[breakpoints.length - 1][1];
  };

  const [count, setCount] = useState(breakpoints[breakpoints.length - 1][1]);

  useEffect(() => {
    const update = () => {
      const newCount = getCount();
      setCount(newCount);
      onUpdate?.(newCount);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return count;
}
