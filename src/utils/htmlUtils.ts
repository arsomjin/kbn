/**
 * Safely parses HTML content to prevent XSS attacks
 * This is a simple implementation - in production, consider using libraries like DOMPurify
 */
export const sanitizeHtml = (html: string): string => {
  // Create a temporary element
  const tempElement = document.createElement('div');
  tempElement.textContent = html;

  // Return sanitized HTML (this strips all HTML tags)
  return tempElement.innerHTML;
};

/**
 * Creates a safe HTML container for rendering sanitized HTML content
 * To be used with React's dangerouslySetInnerHTML
 */
export const createSafeHtml = (html: string): { __html: string } => {
  return { __html: sanitizeHtml(html) };
};
