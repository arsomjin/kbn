/**
 * User Structure Safety Utilities
 * 
 * CRITICAL: This prevents Firestore corruption by handling both:
 * - Clean Slate RBAC structure (new)
 * - Legacy user structures (old)
 * 
 * All components should use these utilities instead of direct property access
 */

/**
 * Safely get user ID from any user structure
 * @param {Object} user - User object in any format
 * @returns {string|null} User ID or null if not found
 */
export const getUserId = (user) => {
  if (!user) return null;
  
  // Try different possible locations for user ID
  return user.uid || user.auth?.uid || user._key || null;
};

/**
 * Safely get user display name from any user structure
 * @param {Object} user - User object in any format
 * @returns {string} Display name or fallback
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  
  // Try different possible sources for display name
  return (
    user.displayName || 
    user.auth?.displayName || 
    `${user.firstName || user.auth?.firstName || ''} ${user.lastName || user.auth?.lastName || ''}`.trim() ||
    user.email ||
    user.auth?.email ||
    'Unknown User'
  );
};

/**
 * Safely get user email from any user structure
 * @param {Object} user - User object in any format
 * @returns {string|null} Email or null if not found
 */
export const getUserEmail = (user) => {
  if (!user) return null;
  
  return user.email || user.auth?.email || null;
};

/**
 * Safely get user photo URL from any user structure
 * @param {Object} user - User object in any format
 * @returns {string|null} Photo URL or null if not found
 */
export const getUserPhotoURL = (user) => {
  if (!user) return null;
  
  return user.photoURL || user.auth?.photoURL || null;
};

/**
 * Safely get user first name from any user structure
 * @param {Object} user - User object in any format
 * @returns {string} First name or empty string
 */
export const getUserFirstName = (user) => {
  if (!user) return '';
  
  return user.firstName || user.auth?.firstName || '';
};

/**
 * Safely get user last name from any user structure
 * @param {Object} user - User object in any format
 * @returns {string} Last name or empty string
 */
export const getUserLastName = (user) => {
  if (!user) return '';
  
  return user.lastName || user.auth?.lastName || '';
};

/**
 * Safely get user phone number from any user structure
 * @param {Object} user - User object in any format
 * @returns {string} Phone number or empty string
 */
export const getUserPhoneNumber = (user) => {
  if (!user) return '';
  
  return user.phoneNumber || user.auth?.phoneNumber || '';
};

/**
 * Safely get user home branch from any user structure
 * @param {Object} user - User object in any format
 * @returns {string|null} Home branch or null if not found
 */
export const getUserHomeBranch = (user) => {
  if (!user) return null;
  
  return (
    user.homeBranch ||
    user.geographic?.homeBranch ||
    user.access?.geographic?.homeBranch ||
    user.allowedBranches?.[0] ||
    null
  );
};

/**
 * Safely get user home province from any user structure
 * @param {Object} user - User object in any format
 * @returns {string|null} Home province or null if not found
 */
export const getUserHomeProvince = (user) => {
  if (!user) return null;
  
  return (
    user.homeProvince ||
    user.geographic?.homeProvince ||
    user.access?.geographic?.homeProvince ||
    user.allowedProvinces?.[0] ||
    null
  );
};

/**
 * Check if user has Clean Slate RBAC structure
 * @param {Object} user - User object to check
 * @returns {boolean} True if user has Clean Slate structure
 */
export const isCleanSlateUser = (user) => {
  return !!(user?.access?.authority && user?.access?.geographic);
};

/**
 * Check if user has legacy structure
 * @param {Object} user - User object to check
 * @returns {boolean} True if user has legacy structure
 */
export const isLegacyUser = (user) => {
  return !!(user?.auth || user?.userRBAC || user?.accessLevel);
};

/**
 * Safe Firestore update - prevents writing to wrong structure
 * @param {Object} userRef - Firestore user document reference
 * @param {Object} updates - Update data
 * @param {Object} options - Update options
 * @returns {Promise} Update promise
 */
export const safeUserUpdate = async (userRef, updates, options = {}) => {
  try {
    // Get current document to understand structure
    const docSnap = await userRef.get();
    
    if (!docSnap.exists) {
      throw new Error('User document does not exist');
    }
    
    const existingData = docSnap.data();
    
    // Determine document structure
    const isCleanSlate = isCleanSlateUser(existingData);
    const isLegacy = isLegacyUser(existingData);
    
    console.log(`🔍 User structure detected: ${isCleanSlate ? 'Clean Slate' : isLegacy ? 'Legacy' : 'Unknown'}`);
    
    if (isCleanSlate) {
      // Clean Slate structure - safe to update at root level
      console.log('✅ Updating Clean Slate user document');
      await userRef.update(updates);
    } else if (isLegacy) {
      // Legacy structure - need to be careful about nested updates
      console.warn('⚠️ Updating legacy user document - using safe update strategy');
      
      // For legacy, only update specific safe fields at root level
      const safeUpdates = {};
      const unsafeUpdates = { auth: { ...existingData.auth } };
      
      // Determine which updates are safe for root level
      Object.entries(updates).forEach(([key, value]) => {
        if (['displayName', 'photoURL', 'isActive', 'status', 'description'].includes(key)) {
          safeUpdates[key] = value;
        } else {
          // Personal data goes into auth object for legacy users
          unsafeUpdates.auth[key] = value;
        }
      });
      
      const finalUpdates = {
        ...safeUpdates,
        ...(Object.keys(unsafeUpdates.auth).length > Object.keys(existingData.auth || {}).length ? { auth: unsafeUpdates.auth } : {})
      };
      
      await userRef.update(finalUpdates);
    } else {
      // Unknown structure - very careful update
      console.error('🚨 Unknown user document structure - using minimal safe update');
      
      // Only update absolutely safe fields
      const minimalSafeUpdates = {};
      ['displayName', 'photoURL', 'isActive', 'description'].forEach(key => {
        if (updates[key] !== undefined) {
          minimalSafeUpdates[key] = updates[key];
        }
      });
      
      if (Object.keys(minimalSafeUpdates).length > 0) {
        await userRef.update(minimalSafeUpdates);
      } else {
        throw new Error('No safe fields to update in unknown user structure');
      }
    }
    
  } catch (error) {
    console.error('🚨 Safe user update failed:', error);
    throw error;
  }
};

/**
 * Validate user structure and provide migration recommendations
 * @param {Object} user - User object to validate
 * @returns {Object} Validation result with recommendations
 */
export const validateUserStructure = (user) => {
  if (!user) {
    return {
      isValid: false,
      structure: 'missing',
      issues: ['User object is null or undefined'],
      recommendations: ['Ensure user is loaded before use']
    };
  }
  
  const issues = [];
  const recommendations = [];
  
  // Check for required fields
  const userId = getUserId(user);
  if (!userId) {
    issues.push('Missing user ID (uid, auth.uid, or _key)');
    recommendations.push('Ensure user has a valid identifier');
  }
  
  const email = getUserEmail(user);
  if (!email) {
    issues.push('Missing email address');
    recommendations.push('Ensure user has an email address');
  }
  
  // Determine structure type
  const isCleanSlate = isCleanSlateUser(user);
  const isLegacy = isLegacyUser(user);
  
  let structure = 'unknown';
  if (isCleanSlate) {
    structure = 'clean-slate';
  } else if (isLegacy) {
    structure = 'legacy';
    recommendations.push('Consider migrating to Clean Slate RBAC structure');
  }
  
  // Check for mixed structures (dangerous)
  if (isCleanSlate && isLegacy) {
    issues.push('Mixed Clean Slate and legacy structures detected');
    recommendations.push('URGENT: Clean up mixed structure to prevent data corruption');
  }
  
  return {
    isValid: issues.length === 0,
    structure,
    issues,
    recommendations,
    hasUserId: !!userId,
    hasEmail: !!email,
    isCleanSlate,
    isLegacy
  };
};

// Export safety checkers
export {
  isCleanSlateUser as hasCleanSlateStructure,
  isLegacyUser as hasLegacyStructure
}; 