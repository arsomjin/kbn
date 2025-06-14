/**
 * Step Utilities
 * Helper functions for converting between different step formats
 */

/**
 * Converts steps to Ant Design Steps format
 * @param {Array} steps - Array of strings or objects
 * @returns {Array} - Array of objects with title and description
 */
export const convertToAntSteps = (steps = []) => {
  return steps.map((step, index) => {
    if (typeof step === 'string') {
      return {
        title: step,
        description: `ขั้นตอนที่ ${index + 1}`
      };
    } else if (typeof step === 'object' && step.title) {
      return step;
    } else {
      return {
        title: `ขั้นตอน ${index + 1}`,
        description: 'รายละเอียดขั้นตอน'
      };
    }
  });
};

/**
 * Converts steps to Material-UI format (strings only)
 * @param {Array} steps - Array of strings or objects
 * @returns {Array} - Array of strings
 */
export const convertToMaterialSteps = (steps = []) => {
  return steps.map(step => {
    if (typeof step === 'string') {
      return step;
    } else if (typeof step === 'object' && step.title) {
      return step.title;
    } else {
      return 'ขั้นตอน';
    }
  });
};

/**
 * Validates step format
 * @param {Array} steps - Steps array to validate
 * @returns {boolean} - Whether the format is valid
 */
export const validateSteps = (steps = []) => {
  if (!Array.isArray(steps)) return false;
  
  return steps.every(step => {
    return typeof step === 'string' || 
           (typeof step === 'object' && step.title);
  });
};

/**
 * Gets step title regardless of format
 * @param {string|object} step - Step item
 * @returns {string} - Step title
 */
export const getStepTitle = (step) => {
  if (typeof step === 'string') {
    return step;
  } else if (typeof step === 'object' && step.title) {
    return step.title;
  }
  return 'ขั้นตอน';
};

/**
 * Gets step description regardless of format
 * @param {string|object} step - Step item
 * @returns {string} - Step description
 */
export const getStepDescription = (step) => {
  if (typeof step === 'object' && step.description) {
    return step.description;
  }
  return '';
};

/**
 * Normalizes steps array to ensure consistency
 * @param {Array} steps - Steps array
 * @param {string} format - Target format ('ant' or 'material')
 * @returns {Array} - Normalized steps array
 */
export const normalizeSteps = (steps = [], format = 'ant') => {
  if (format === 'ant') {
    return convertToAntSteps(steps);
  } else if (format === 'material') {
    return convertToMaterialSteps(steps);
  }
  return steps;
};

export default {
  convertToAntSteps,
  convertToMaterialSteps,
  validateSteps,
  getStepTitle,
  getStepDescription,
  normalizeSteps
}; 