/**
 * RBAC-Based Branch Default Utilities
 * Provides consistent branch fallback logic across the application
 */

/**
 * Get default branch code using RBAC hierarchy
 * @param {Object} user - User object from Redux store
 * @param {Function} getDefaultBranch - Function from useGeographicData hook
 * @param {string} contextBranch - Context-specific branch (e.g., from order, document)
 * @returns {string} Branch code to use
 */
export const getDefaultBranchCode = (
  user,
  getDefaultBranch,
  contextBranch = null
) => {
  // Priority hierarchy:
  // 1. Context-specific branch (from document, order, etc.)
  // 2. User's current branch (user.branch)
  // 3. RBAC default branch (from getDefaultBranch hook)
  // 4. User's home branch (user.homeBranch)
  // 5. First allowed branch for single-branch users
  // 6. Legacy fallback to "0450" for backward compatibility

  if (contextBranch) return contextBranch;
  if (user?.branch) return user.branch;

  const rbacDefault = getDefaultBranch?.();
  if (rbacDefault) return rbacDefault;

  if (user?.homeBranch) return user.homeBranch;

  if (user?.allowedBranches?.length === 1) {
    return user.allowedBranches[0];
  }

  // Final fallback for backward compatibility
  return '0450';
};

/**
 * Create branch initialization object for forms/components
 * @param {Object} user - User object
 * @param {Function} getDefaultBranch - getDefaultBranch function
 * @param {Object} options - Additional options
 * @returns {Object} Branch initialization object
 */
export const createBranchInit = (user, getDefaultBranch, options = {}) => {
  const { contextBranch, fieldName = 'branchCode' } = options;

  const defaultBranch = getDefaultBranchCode(
    user,
    getDefaultBranch,
    contextBranch
  );

  return {
    [fieldName]: defaultBranch,
  };
};

/**
 * Get branch fallback with logging for debugging
 * @param {Object} user - User object
 * @param {Function} getDefaultBranch - getDefaultBranch function
 * @param {string} contextBranch - Context branch
 * @param {string} component - Component name for logging
 * @returns {string} Branch code
 */
export const getDefaultBranchWithLogging = (
  user,
  getDefaultBranch,
  contextBranch,
  component
) => {
  const result = getDefaultBranchCode(user, getDefaultBranch, contextBranch);

  if (process.env.NODE_ENV === 'development') {
    const source = contextBranch
      ? 'context'
      : user?.branch
        ? 'user.branch'
        : getDefaultBranch?.()
          ? 'RBAC default'
          : user?.homeBranch
            ? 'user.homeBranch'
            : user?.allowedBranches?.length === 1
              ? 'first allowed'
              : 'legacy fallback';

    console.log(`[${component}] Branch default: ${result} (source: ${source})`);
  }

  return result;
};

/**
 * Validate branch access for user
 * @param {string} branchCode - Branch code to validate
 * @param {Object} user - User object
 * @returns {boolean} Whether user can access this branch
 */
export const canUserAccessBranch = (branchCode, user) => {
  // Super admin can access all branches
  if (user?.accessLevel === 'all') return true;

  // Check if branch is in user's allowed branches
  if (user?.allowedBranches?.includes(branchCode)) return true;

  // Legacy support: if user has old branch property matching
  if (user?.branch === branchCode) return true;

  return false;
};

export default {
  getDefaultBranchCode,
  createBranchInit,
  getDefaultBranchWithLogging,
  canUserAccessBranch,
};
