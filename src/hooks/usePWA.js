import { useEffect } from 'react';
import { addDeferredPrompt } from 'store/slices/pwaSlice';

export const usePWA = () => {
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      addDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
  }, []);
};
