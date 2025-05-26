import React, { FC, ReactNode, useEffect } from 'react';
import useEnterKeyNavigation from '../hooks/useEnterKeyNavigation';
import useInputNumberFocus from '../hooks/useInputNumberFocus';

interface EnterKeyNavigationProviderProps {
  children: ReactNode;
}

/**
 * Component that wraps content and adds:
 * 1. Enter key navigation capabilities to all form elements
 * 2. InputNumber zero-clearing on focus
 */
const EnterKeyNavigationProvider: FC<EnterKeyNavigationProviderProps> = ({ children }) => {
  const { onKeyDown } = useEnterKeyNavigation();
  const { initializeInputNumberFix } = useInputNumberFocus();

  useEffect(() => {
    // Add the event listener to document so it applies to all inputs
    document.addEventListener('keydown', onKeyDown as any);

    // Initialize InputNumber focus behavior
    const cleanup = initializeInputNumberFix();

    // Clean up when component unmounts
    return () => {
      document.removeEventListener('keydown', onKeyDown as any);
      cleanup();
    };
  }, [onKeyDown, initializeInputNumberFix]);

  return <>{children}</>;
};

export default EnterKeyNavigationProvider;
