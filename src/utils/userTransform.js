/**
 * Transform form data into a User object
 */
export const transformUserData = (formData, uid, userType, currentUser) => {
  const timestamp = Date.now();
  const displayName = `${formData.firstName} ${formData.lastName}`.trim();

  // Base auth information
  const auth = {
    uid,
    created: currentUser?.auth?.created || timestamp,
    displayName,
    email: formData.email,
    emailVerified: currentUser?.auth?.emailVerified || false,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phoneNumber: formData.phoneNumber,
    isAnonymous: false,
    lastLogin: timestamp,
    photoURL: formData.photoURL,
  };

  // Base fields
  const baseFields = {
    auth,
    status: currentUser?.status || 'pending',
    role: currentUser?.role || 'pending',
    type: userType,
    deleted: false,
    created: currentUser?.created || timestamp,
    updated: timestamp,
    inputBy: uid,
    provinceId: formData.province || '',
  };

  // Type-specific information
  if (userType === 'employee') {
    const employeeInfo = {
      employeeCode: formData.employeeId || '',
      department: formData.department,
      position: formData.position,
      branch: formData.branch,
      workBegin: formData.workBegin || null,
      workEnd: formData.workEnd,
      employeeId: '',
    };

    return {
      ...baseFields,
      employeeInfo,
    };
  } else {
    const visitorInfo = {
      purpose: formData.purpose || '',
      organization: formData.organization,
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate,
    };

    return {
      ...baseFields,
      visitorInfo,
    };
  }
};

/**
 * Transform a User object to UserProfile for UI/forms
 */
export const transformToUserProfile = (user) => {
  const baseProfile = {
    uid: user.id,
    accessibleProvinceIds: [],
    permissions: [],
    province: user.provinceId, // Map provinceId from User to province in UserProfile
    role: user.role,
    createdAt: user.created ? new Date(user.created) : undefined,
    updatedAt: user.updated ? new Date(user.updated) : undefined,
    company: '',
    purpose: '',
  };

  if (user.type === 'employee' && user.employeeInfo) {
    return {
      ...baseProfile,
      employeeInfo: {
        branch: user.employeeInfo.branch || '',
        department: user.employeeInfo.department || '',
        employeeCode: user.employeeInfo.employeeCode || '',
        employeeId: user.employeeInfo.employeeId,
        workBegin: user.employeeInfo.workBegin || null,
      },
      requestedType: 'employee',
    };
  }

  if (user.type === 'visitor' && user.visitorInfo) {
    return {
      ...baseProfile,
      requestedType: 'visitor',
      company: user.visitorInfo.organization || '',
      purpose: user.visitorInfo.purpose,
    };
  }

  return baseProfile;
};

/**
 * Removes undefined fields and converts Date objects to ISO strings
 * @param obj Object to clean
 * @returns Cleaned object with no undefined fields and serialized dates
 */
export const removeUndefinedFields = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item));
  }

  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned;
  }

  return obj;
};

// Default export containing all the utility functions
const userTransform = {
  transformUserData,
  transformToUserProfile,
  removeUndefinedFields,
};

export default userTransform;
