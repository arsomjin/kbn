import { useCallback } from 'react';

/**
 * Hook that automatically clears 0 values in InputNumber components when focused
 */
export function useInputNumberFocus() {
  const initializeInputNumberFix = useCallback(() => {
    // Function to handle focus events
    const handleInputFocus = function (e: Event) {
      const target = e.target as HTMLInputElement;

      // Check if the value is zero or formatted zero
      if (
        target.value === '0' ||
        target.value === '0.00' ||
        target.value === '0.0' ||
        target.value === '0.' ||
        target.value.trim() === '0'
      ) {
        // Delay clearing to ensure it happens after React's updates
        setTimeout(() => {
          target.value = '';

          // Dispatch events to notify React of the change
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        }, 0);
      }
    };

    // Use MutationObserver to handle dynamically added InputNumber components
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Find all InputNumber components in the document
          const inputNumbers = document.querySelectorAll('.ant-input-number');

          inputNumbers.forEach(inputNumber => {
            const inputElement = inputNumber.querySelector('input.ant-input-number-input');
            if (!inputElement) return;

            // Check if we've already processed this element
            if (inputElement.getAttribute('data-zero-clear-applied')) return;

            // Mark as processed
            inputElement.setAttribute('data-zero-clear-applied', 'true');

            // Add focus event listener
            inputElement.addEventListener('focus', handleInputFocus);
          });
        }
      }
    });

    // Start observing the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Process existing InputNumber components immediately
    const inputNumbers = document.querySelectorAll('.ant-input-number');
    inputNumbers.forEach(inputNumber => {
      const inputElement = inputNumber.querySelector('input.ant-input-number-input');
      if (!inputElement) return;

      // Add focus event listener if not already added
      if (!inputElement.getAttribute('data-zero-clear-applied')) {
        inputElement.addEventListener('focus', handleInputFocus);

        // Mark as processed
        inputElement.setAttribute('data-zero-clear-applied', 'true');
      }
    });

    return () => {
      // Clean up the observer
      observer.disconnect();

      // Remove event listeners from all InputNumber inputs
      const inputElements = document.querySelectorAll('input.ant-input-number-input[data-zero-clear-applied="true"]');
      inputElements.forEach(input => {
        input.removeEventListener('focus', handleInputFocus);
        input.removeAttribute('data-zero-clear-applied');
      });
    };
  }, []);

  return { initializeInputNumberFix };
}

export default useInputNumberFocus;
