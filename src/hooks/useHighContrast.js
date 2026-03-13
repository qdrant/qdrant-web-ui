import { useState, useCallback } from 'react';

const STORAGE_KEY = 'qdrant-high-contrast';

export function useHighContrast() {
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { highContrast, toggleHighContrast };
}
