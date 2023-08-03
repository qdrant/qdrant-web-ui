import { useEffect, useState } from 'react';

export const useWindowResize = () => {
  const [resized, setResized] = useState(false);
  const handleResized = () => setResized(!resized);

  useEffect(() => {
    window.addEventListener('resize', handleResized);
    return () => {
      window.removeEventListener('resize', handleResized);
    };
  });

  return { width: window.innerWidth, height: window.innerHeight };
};

// add more window hooks here as needed
