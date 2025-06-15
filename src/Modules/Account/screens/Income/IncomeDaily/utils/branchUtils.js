/**
 * 🏢 BRANCH UTILITIES FOR MULTI-PROVINCE SUPPORT
 *
 * Boss, this replaces hardcoded '0450' with smart province-aware defaults!
 */

/**
 * Get default branch based on user's province and permissions
 * @param {Object} user - User object with RBAC data
 * @returns {string} Default branch code
 */
export const getSmartDefaultBranch = (user) => {
  // Priority 1: User's home branch
  if (user?.homeBranch) {
    return user.homeBranch;
  }

  // Priority 2: First allowed branch
  if (user?.allowedBranches?.length > 0) {
    return user.allowedBranches[0];
  }

  // Priority 3: Based on user's home province
  if (user?.homeProvince) {
    const provinceDefaults = {
      'nakhon-ratchasima': '0450', // Head office for NMA
      'nakhon-sawan': 'NSN001', // Main branch for NSN
      นครราชสีมา: '0450',
      นครสวรรค์: 'NSN001',
    };

    if (provinceDefaults[user.homeProvince]) {
      return provinceDefaults[user.homeProvince];
    }
  }

  // Priority 4: Based on user's province from allowedProvinces
  if (user?.allowedProvinces?.length > 0) {
    const firstProvince = user.allowedProvinces[0];
    const provinceDefaults = {
      'nakhon-ratchasima': '0450',
      'nakhon-sawan': 'NSN001',
      นครราชสีมา: '0450',
      นครสวรรค์: 'NSN001',
    };

    if (provinceDefaults[firstProvince]) {
      return provinceDefaults[firstProvince];
    }
  }

  // Priority 5: Check RBAC structure
  if (user?.access?.geographic?.allowedBranches?.length > 0) {
    return user.access.geographic.allowedBranches[0];
  }

  if (user?.access?.geographic?.homeProvince) {
    const provinceDefaults = {
      'nakhon-ratchasima': '0450',
      'nakhon-sawan': 'NSN001',
    };

    if (provinceDefaults[user.access.geographic.homeProvince]) {
      return provinceDefaults[user.access.geographic.homeProvince];
    }
  }

  // Fallback: Default to original head office
  return '0450';
};

/**
 * Check if branch supports specific feature
 * @param {string} branchCode - Branch code
 * @param {string} feature - Feature name (e.g., 'partChange')
 * @returns {boolean} Whether branch supports the feature
 */
export const branchSupportsFeature = (branchCode, feature) => {
  // Feature availability by branch
  const featureMatrix = {
    partChange: {
      // Only head offices support part change
      supportedBranches: ['0450', 'NSN001'],
      description: 'Part change transactions',
    },
  };

  const featureConfig = featureMatrix[feature];
  if (!featureConfig) {
    return true; // If feature not defined, assume supported
  }

  return featureConfig.supportedBranches.includes(branchCode);
};

/**
 * Get province-aware default values for forms
 * @param {Object} user - User object
 * @param {Object} existingOrder - Existing order data (for edit mode)
 * @returns {Object} Default form values
 */
export const getProvinceAwareDefaults = (user, existingOrder = null) => {
  const defaultBranch = getSmartDefaultBranch(user);

  return {
    branchCode: existingOrder?.branchCode || defaultBranch,
    provinceId:
      existingOrder?.provinceId ||
      user?.homeProvince ||
      user?.allowedProvinces?.[0] ||
      'nakhon-ratchasima',
    // Add other province-aware defaults as needed
  };
};

export default {
  getSmartDefaultBranch,
  branchSupportsFeature,
  getProvinceAwareDefaults,
};
