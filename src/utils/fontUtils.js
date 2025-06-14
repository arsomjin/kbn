/**
 * Font Utilities for Thai and English Text
 * Provides helper functions for language detection and font application
 */

/**
 * Detects if text contains Thai characters
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if text contains Thai characters
 */
export const containsThai = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Thai Unicode range: U+0E00–U+0E7F
  const thaiRegex = /[\u0E00-\u0E7F]/;
  return thaiRegex.test(text);
};

/**
 * Detects if text contains only English characters
 * @param {string} text - The text to analyze
 * @returns {boolean} - True if text contains only English/Latin characters
 */
export const containsOnlyEnglish = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // English/Latin Unicode ranges
  const englishRegex = /^[a-zA-Z0-9\s\p{P}\p{S}]*$/u;
  return englishRegex.test(text);
};

/**
 * Determines the appropriate font class based on text content
 * @param {string} text - The text to analyze
 * @returns {string} - CSS class name for the appropriate font
 */
export const getFontClass = (text) => {
  if (containsThai(text)) {
    return 'thai-text';
  } else if (containsOnlyEnglish(text)) {
    return 'english-text';
  }
  return 'mixed-content';
};

/**
 * Applies language-specific font styling to a DOM element
 * @param {HTMLElement} element - The DOM element to style
 * @param {string} text - The text content to analyze
 */
export const applyFontStyling = (element, text) => {
  if (!element || !text) return;
  
  const fontClass = getFontClass(text);
  
  // Remove existing font classes
  element.classList.remove('thai-text', 'english-text', 'mixed-content');
  
  // Add appropriate font class
  element.classList.add(fontClass);
  
  // Set lang attribute for better accessibility and SEO
  if (containsThai(text)) {
    element.setAttribute('lang', 'th');
  } else if (containsOnlyEnglish(text)) {
    element.setAttribute('lang', 'en');
  }
};

/**
 * React hook for font styling (if using React functional components)
 * @param {string} text - The text content
 * @returns {object} - Object with className and lang properties
 */
export const useFontStyling = (text) => {
  const fontClass = getFontClass(text);
  let lang = '';
  
  if (containsThai(text)) {
    lang = 'th';
  } else if (containsOnlyEnglish(text)) {
    lang = 'en';
  }
  
  return {
    className: fontClass,
    lang: lang
  };
};

/**
 * Automatically applies font styling to all text nodes within a container
 * @param {HTMLElement} container - The container element to process
 */
export const autoApplyFontStyling = (container) => {
  if (!container) return;
  
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const textNodes = [];
  let node;
  
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  textNodes.forEach(textNode => {
    const text = textNode.textContent.trim();
    if (text) {
      const parentElement = textNode.parentElement;
      if (parentElement) {
        applyFontStyling(parentElement, text);
      }
    }
  });
};

/**
 * Debounced version of autoApplyFontStyling for better performance
 * @param {HTMLElement} container - The container element to process
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 */
export const debouncedAutoApplyFontStyling = (() => {
  let timeoutId;
  
  return (container, delay = 300) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      autoApplyFontStyling(container);
    }, delay);
  };
})();

/**
 * Initialize font styling for the entire document
 * Call this function after the DOM is ready
 */
export const initializeFontStyling = () => {
  // Apply to existing content
  autoApplyFontStyling(document.body);
  
  // Set up observer for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            debouncedAutoApplyFontStyling(node);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

// Export default object with all utilities
export default {
  containsThai,
  containsOnlyEnglish,
  getFontClass,
  applyFontStyling,
  useFontStyling,
  autoApplyFontStyling,
  debouncedAutoApplyFontStyling,
  initializeFontStyling
}; 