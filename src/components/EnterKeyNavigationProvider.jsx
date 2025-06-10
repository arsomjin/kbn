import React, { FC, ReactNode, useEffect } from 'react';
import useEnterKeyNavigation from '../hooks/useEnterKeyNavigation';
import useInputNumberFocus from '../hooks/useInputNumberFocus';


/**
 * Component that wraps content and adds:
 * 1. Enter key navigation capabilities to all form elements
 * 2. InputNumber zero-clearing on focus
 */
const EnterKeyNavigationProvider = ({ children }) => {
  const { onKeyDown } = useEnterKeyNavigation();
  const { initializeInputNumberFix } = useInputNumberFocus();

  useEffect(() => {
    // Add the event listener to document so it applies to all inputs
    document.addEventListener('keydown', onKeyDown);

    // Initialize InputNumber focus behavior
    const cleanup = initializeInputNumberFix();

    // Clean up when component unmounts
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cleanup();
    };
  }, [onKeyDown, initializeInputNumberFix]);

  return <>{children}</>;
};

export default EnterKeyNavigationProvider;
