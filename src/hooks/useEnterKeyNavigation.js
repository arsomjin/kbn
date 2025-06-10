import { useCallback, KeyboardEvent } from 'react';

/**
 * Custom hook that enables using the Enter key to navigate between form fields,
 * similar to Tab key behavior
 */
export function useEnterKeyNavigation() {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't apply to textarea or elements that need Enter for their functionality
      const tagName = (e.target).tagName.toLowerCase();
      if (tagName === 'textarea') return;

      // Don't interfere with Enter key for buttons
      if (tagName === 'button' || (e.target).getAttribute('role') === 'button') return;

      e.preventDefault();

      // Find all focusable elements
      const focusableElements =
        'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
      const elements = Array.from(document.querySelectorAll(focusableElements));

      // Find current element index
      const currentIndex = elements.indexOf(e.target);
      const nextElement = elements[currentIndex + 1];

      // Focus next element if available
      if (nextElement) {
        nextElement.focus();

        // If the next element is an input, select all text
        if (nextElement.tagName.toLowerCase() === 'input') {
          (nextElement).select();
        }
      }
    }
  }, []);

  return { onKeyDown: handleKeyDown };
}

export default useEnterKeyNavigation;
