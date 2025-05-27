// Dimensions API for responsive design utilities

/**
 * Get responsive height based on device type and screen width
 * @param {Object} options - Height options for different devices
 * @param {number} options.mobile - Height for mobile devices
 * @param {number} options.tablet - Height for tablet devices
 * @param {number} options.desktop - Height for desktop devices
 * @param {number} options.default - Default height
 * @returns {number} Calculated height
 */
export const h = (options = {}) => {
  if (typeof options === 'number') {
    return options;
  }

  const { mobile = 300, tablet = 400, desktop = 500, default: defaultHeight = 400 } = options;

  const width = window.innerWidth;

  if (width < 768) return mobile;
  if (width < 1024) return tablet;
  if (width >= 1024) return desktop;

  return defaultHeight;
};

/**
 * Get responsive width based on device type and screen width
 * @param {Object} options - Width options for different devices
 * @returns {number} Calculated width
 */
export const w = (options = {}) => {
  if (typeof options === 'number') {
    return options;
  }

  const { mobile = 300, tablet = 600, desktop = 800, default: defaultWidth = 600 } = options;

  const width = window.innerWidth;

  if (width < 768) return mobile;
  if (width < 1024) return tablet;
  if (width >= 1024) return desktop;

  return defaultWidth;
};

/**
 * Get device-specific dimensions
 * @returns {Object} Dimension utilities
 */
export const getDimensions = () => {
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    h,
    w,
  };
};
