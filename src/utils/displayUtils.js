import { ROLES } from '../constants/roles';

/**
 * =============================================================================
 * DISPLAY NAME UTILITIES
 * =============================================================================
 *
 * These utilities provide consistent display names for various entities
 * across the application, with translation support.
 */

/**
 * Get display name for a role with translation support
 * @param {string} role - The role identifier
 * @param {function} t - Translation function from useTranslation
 * @returns {string} - Translated role name or fallback
 */
export const getRoleDisplayName = (role, t) => {
  if (!role) return '';

  // Try to get translation first
  if (t) {
    const roleKey = `roles:${role}.label`;
    const translatedName = t(roleKey, { defaultValue: null });

    if (translatedName && translatedName !== roleKey) {
      return translatedName;
    }
  }

  // Fallback to English role names if translation not found
  const fallbackNames = {
    [ROLES.GUEST]: 'Guest',
    [ROLES.PENDING]: 'Pending',
    [ROLES.USER]: 'Standard User',
    [ROLES.LEAD]: 'Team Lead',
    [ROLES.BRANCH_MANAGER]: 'Branch Manager',
    [ROLES.PROVINCE_MANAGER]: 'Province Manager',
    [ROLES.PROVINCE_ADMIN]: 'Province Admin',
    [ROLES.GENERAL_MANAGER]: 'General Manager',
    [ROLES.EXECUTIVE]: 'Executive User',
    [ROLES.SUPER_ADMIN]: 'System Administrator',
    [ROLES.DEVELOPER]: 'Developer',
  };

  return fallbackNames[role] || role;
};

/**
 * Get display name for a province
 * @param {string} provinceId - The province identifier
 * @param {Object} provinces - Provinces data object from Redux store
 * @param {function} t - Translation function from useTranslation (optional)
 * @returns {string|null} - Province display name or null
 */
export const getProvinceDisplayName = (provinceId, provinces = {}, t = null) => {
  if (!provinceId) return null;

  const province = provinces[provinceId];
  if (province) {
    // Try translation first if available
    if (t) {
      const translatedName = t(`provinces:${provinceId}`, { defaultValue: null });
      if (translatedName && translatedName !== `provinces:${provinceId}`) {
        return translatedName;
      }
    }

    // Fallback to province data
    return province.name || province.nameEn || provinceId;
  }

  return provinceId;
};

/**
 * Get display name for a branch
 * @param {string} branchCode - The branch code/identifier
 * @param {Object} branches - Branches data object from Redux store
 * @param {string} provinceId - Optional province ID to filter branches
 * @param {function} t - Translation function from useTranslation (optional)
 * @returns {string|null} - Branch display name or null
 */
export const getBranchDisplayName = (branchCode, branches = {}, provinceId = null, t = null) => {
  if (!branchCode) return null;

  // Find branch in the branches data
  const branch = Object.values(branches).find(
    (b) =>
      (b.branchCode === branchCode || b.id === branchCode) &&
      (provinceId ? b.provinceId === provinceId : true),
  );

  if (branch) {
    // Try translation first if available
    if (t) {
      const translatedName = t(`branches:${branchCode}`, { defaultValue: null });
      if (translatedName && translatedName !== `branches:${branchCode}`) {
        return translatedName;
      }
    }

    // Fallback to branch data
    return branch.branchName || branch.name || branch.nameEn || branchCode;
  }

  return branchCode;
};

/**
 * Get access layer display name with translation support
 * @param {string} layer - The access layer identifier
 * @param {function} t - Translation function from useTranslation
 * @returns {string} - Translated layer name or fallback
 */
export const getAccessLayerDisplayName = (layer, t) => {
  if (!layer) return '';

  if (t) {
    const layerKey = `debug:accessLayers.${layer}`;
    const translatedName = t(layerKey, { defaultValue: null });

    if (translatedName && translatedName !== layerKey) {
      return translatedName;
    }
  }

  // Fallback names
  const fallbackNames = {
    guest: 'Guest',
    executive: 'Executive',
    general_manager: 'General Manager',
    province: 'Province',
    branch_manager: 'Branch Manager',
    branch_staff: 'Branch Staff',
  };

  return fallbackNames[layer] || layer;
};

/**
 * Get formatted user location info (Province + Branch)
 * @param {Object} userProfile - User profile object
 * @param {Object} provinces - Provinces data object
 * @param {Object} branches - Branches data object
 * @param {function} t - Translation function
 * @returns {Object} - Object with province and branch info
 */
export const getUserLocationInfo = (userProfile, provinces = {}, branches = {}, t = null) => {
  if (!userProfile) return { province: null, branch: null };

  const provinceId = userProfile.provinceId || userProfile.province;
  const branchCode =
    userProfile?.employeeInfo?.branch || userProfile?.branch || userProfile?.branchCode;

  return {
    province: provinceId
      ? {
          id: provinceId,
          name: getProvinceDisplayName(provinceId, provinces, t),
        }
      : null,
    branch: branchCode
      ? {
          code: branchCode,
          name: getBranchDisplayName(branchCode, branches, provinceId, t),
        }
      : null,
  };
};

/**
 * Format user display name with fallbacks
 * @param {Object} userProfile - User profile object
 * @param {Object} user - Firebase user object (optional)
 * @returns {string} - Formatted display name
 */
export const getUserDisplayName = (userProfile, user = null) => {
  if (!userProfile && !user) return 'Unknown User';

  // Try different name combinations
  if (userProfile?.displayName) return userProfile.displayName;
  if (userProfile?.firstName && userProfile?.lastName) {
    return `${userProfile.firstName} ${userProfile.lastName}`.trim();
  }
  if (userProfile?.firstName) return userProfile.firstName;
  if (userProfile?.lastName) return userProfile.lastName;
  if (user?.displayName) return user.displayName;
  if (userProfile?.email) return userProfile.email.split('@')[0];
  if (user?.email) return user.email.split('@')[0];

  return 'Unknown User';
};

/**
 * Get role color for UI components (consistent with existing role colors)
 * @param {string} role - The role identifier
 * @returns {string} - Ant Design color name
 */
export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.SUPER_ADMIN]: 'magenta',
    [ROLES.PROVINCE_ADMIN]: 'red',
    [ROLES.EXECUTIVE]: 'volcano',
    [ROLES.GENERAL_MANAGER]: 'orange',
    [ROLES.PROVINCE_MANAGER]: 'gold',
    [ROLES.BRANCH_MANAGER]: 'lime',
    [ROLES.LEAD]: 'green',
    [ROLES.USER]: 'cyan',
    [ROLES.PENDING]: 'purple',
    [ROLES.GUEST]: 'default',
    [ROLES.DEVELOPER]: 'geekblue',
  };

  return roleColors[role] || 'default';
};
