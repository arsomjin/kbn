/**
 * Firebase Error Handler Utility
 * Provides consistent error messaging for Firebase-related errors
 */

// Different categories of Firebase errors
export enum FirebaseErrorCategory {
  AUTH = 'auth',
  FIRESTORE = 'firestore',
  STORAGE = 'storage',
  FUNCTIONS = 'functions',
  MESSAGING = 'messaging',
  UNKNOWN = 'unknown'
}

// Define interface for error handling
export interface FirebaseErrorDetails {
  message: string;
  severity: 'error' | 'warning' | 'info';
  userFacing: boolean; // Whether this message can be shown to users directly
}

// Main error mapping object organized by category
const errorMappings: Record<string, FirebaseErrorDetails> = {
  // Authentication errors
  'auth/invalid-credential': {
    message: 'Invalid email or password.',
    severity: 'error',
    userFacing: true
  },
  'auth/user-not-found': {
    message: 'No account found with this email.',
    severity: 'error',
    userFacing: true
  },
  'auth/wrong-password': {
    message: 'Invalid email or password.',
    severity: 'error',
    userFacing: true
  },
  'auth/email-already-in-use': {
    message: 'This email is already registered.',
    severity: 'error',
    userFacing: true
  },
  'auth/weak-password': {
    message: 'Password is too weak. Please use a stronger password.',
    severity: 'error',
    userFacing: true
  },
  'auth/too-many-requests': {
    message: 'Too many failed attempts. Please try again later.',
    severity: 'warning',
    userFacing: true
  },
  'auth/network-request-failed': {
    message: 'Network error. Please check your connection.',
    severity: 'warning',
    userFacing: true
  },
  'auth/invalid-email': {
    message: 'The email address is not valid.',
    severity: 'error',
    userFacing: true
  },
  'auth/user-disabled': {
    message: 'This account has been disabled.',
    severity: 'error',
    userFacing: true
  },
  'auth/requires-recent-login': {
    message: 'Please sign in again to complete this security-sensitive action.',
    severity: 'warning',
    userFacing: true
  },
  'auth/popup-closed-by-user': {
    message: 'Sign in was cancelled.',
    severity: 'info',
    userFacing: true
  },
  // Google Sign-in specific errors
  'auth/account-exists-with-different-credential': {
    message:
      'An account already exists with the same email but different sign-in credentials. Try signing in using a different method.',
    severity: 'error',
    userFacing: true
  },
  'auth/popup-blocked': {
    message: 'Sign-in popup was blocked by your browser. Please enable popups for this site and try again.',
    severity: 'warning',
    userFacing: true
  },
  'auth/cancelled-popup-request': {
    message: 'This operation has been cancelled due to another conflicting popup being opened.',
    severity: 'info',
    userFacing: true
  },
  'auth/google-sign-in-error': {
    message: 'Unable to sign in with Google. Please try again later.',
    severity: 'error',
    userFacing: true
  },

  // Firestore errors
  'firestore/permission-denied': {
    message: "You don't have permission to access this data.",
    severity: 'error',
    userFacing: true
  },
  'firestore/not-found': {
    message: 'The requested document does not exist.',
    severity: 'error',
    userFacing: true
  },
  'firestore/already-exists': {
    message: 'The document already exists.',
    severity: 'error',
    userFacing: true
  },
  'firestore/failed-precondition': {
    message: 'Operation was rejected because the system is not in a state required for the operation.',
    severity: 'error',
    userFacing: false
  },
  'firestore/aborted': {
    message: 'The operation was aborted.',
    severity: 'warning',
    userFacing: true
  },

  // Storage errors
  'storage/unauthorized': {
    message: "You don't have permission to access this file.",
    severity: 'error',
    userFacing: true
  },
  'storage/object-not-found': {
    message: 'The requested file does not exist.',
    severity: 'error',
    userFacing: true
  },
  'storage/quota-exceeded': {
    message: 'Storage quota exceeded.',
    severity: 'error',
    userFacing: true
  },
  'storage/unauthenticated': {
    message: 'Please sign in to access this feature.',
    severity: 'warning',
    userFacing: true
  },
  'storage/canceled': {
    message: 'Upload was canceled.',
    severity: 'info',
    userFacing: true
  }
};

// Default error messages by category
const defaultErrorMessages: Record<FirebaseErrorCategory, string> = {
  [FirebaseErrorCategory.AUTH]: 'An authentication error occurred. Please try again.',
  [FirebaseErrorCategory.FIRESTORE]: 'A database error occurred. Please try again.',
  [FirebaseErrorCategory.STORAGE]: 'A file storage error occurred. Please try again.',
  [FirebaseErrorCategory.FUNCTIONS]: 'A server function error occurred. Please try again.',
  [FirebaseErrorCategory.MESSAGING]: 'A messaging error occurred. Please try again.',
  [FirebaseErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Extract Firebase error code from various error object formats
 *
 * @param error Error object from Firebase
 * @returns Extracted error code or empty string if not found
 */
export function extractErrorCode(error: any): string {
  if (!error) return '';

  // Case 1: error has a code property that is a string
  if (typeof error.code === 'string') {
    // Sometimes Firebase returns codes directly as "auth/invalid-credential"
    if (error.code.includes('/')) {
      return error.code;
    }

    // Handle case where code might be just "invalid-credential"
    for (const category of Object.values(FirebaseErrorCategory)) {
      if (Object.keys(errorMappings).includes(`${category}/${error.code}`)) {
        return `${category}/${error.code}`;
      }
    }

    // Default to auth category if no match found
    if (!error.code.includes('/')) {
      return `auth/${error.code}`;
    }

    return error.code;
  }

  // Case 2: error.message contains a code pattern like "Firebase: Error (auth/invalid-credential)"
  if (typeof error.message === 'string') {
    // Common format in newer Firebase versions: "Firebase: Error (auth/invalid-credential)"
    const newFormatMatch = error.message.match(/Firebase:.*\(([\w-/]+)\)/i);
    if (newFormatMatch && newFormatMatch[1]) {
      return newFormatMatch[1];
    }

    // Alternative format: "Error code: auth/invalid-credential"
    const errorCodeMatch = error.message.match(/Error code:\s*([\w-/]+)/i);
    if (errorCodeMatch && errorCodeMatch[1]) {
      return errorCodeMatch[1];
    }

    // Legacy pattern with parentheses
    for (const category of Object.values(FirebaseErrorCategory)) {
      const regex = new RegExp(`\\(${category}\\/([\w-]+)\\)`);
      const match = error.message.match(regex);
      if (match) {
        return `${category}/${match[1]}`;
      }

      // Try without parentheses
      const regexNoParen = new RegExp(`${category}\\/([\w-]+)`);
      const matchNoParen = error.message.match(regexNoParen);
      if (matchNoParen) {
        return `${category}/${matchNoParen[1]}`;
      }
    }

    // Extract just the error name if it exists in our mappings
    for (const errorKey of Object.keys(errorMappings)) {
      const errorName = errorKey.split('/')[1];
      if (errorName && error.message.toLowerCase().includes(errorName.toLowerCase())) {
        return errorKey;
      }
    }
  }

  // Case 3: error is a string itself
  if (typeof error === 'string') {
    // Check for Firebase error format in string
    const newFormatMatch = error.match(/Firebase:.*\(([\w-/]+)\)/i);
    if (newFormatMatch && newFormatMatch[1]) {
      return newFormatMatch[1];
    }

    for (const category of Object.values(FirebaseErrorCategory)) {
      // Check if the string already is in the format "category/code"
      if (error.startsWith(`${category}/`)) {
        return error;
      }

      // Try to extract the code from a string message
      const regex = new RegExp(`${category}\\/([\w-]+)`, 'i');
      const match = error.match(regex);
      if (match) {
        return `${category}/${match[1]}`;
      }
    }

    // Check if the string matches any known error keys
    for (const errorKey of Object.keys(errorMappings)) {
      const errorName = errorKey.split('/')[1];
      if (errorName && error.toLowerCase().includes(errorName.toLowerCase())) {
        return errorKey;
      }
    }
  }

  // Case 4: Handle specific errors by content matching
  const errorString = error.message || error.toString();
  if (typeof errorString === 'string') {
    if (
      errorString.toLowerCase().includes('invalid credential') ||
      errorString.toLowerCase().includes('invalid email or password')
    ) {
      return 'auth/invalid-credential';
    }
    if (errorString.toLowerCase().includes('no user record') || errorString.toLowerCase().includes('user not found')) {
      return 'auth/user-not-found';
    }
    if (errorString.toLowerCase().includes('wrong password')) {
      return 'auth/wrong-password';
    }
  }

  return '';
}

/**
 * Determine the error category from an error code
 *
 * @param code Error code
 * @returns FirebaseErrorCategory
 */
export function getErrorCategory(code: string): FirebaseErrorCategory {
  if (!code) return FirebaseErrorCategory.UNKNOWN;

  for (const category of Object.values(FirebaseErrorCategory)) {
    if (code.startsWith(`${category}/`)) {
      return category as FirebaseErrorCategory;
    }
  }

  return FirebaseErrorCategory.UNKNOWN;
}

/**
 * Get a user-friendly error message for Firebase errors
 *
 * @param error The error object or string from Firebase
 * @param t Optional translation function (i18n)
 * @returns Localized error message
 */
export function getFirebaseErrorMessage(error: any, t?: (key: string) => string): string {
  if (!error) return '';

  const code = extractErrorCode(error);
  const category = getErrorCategory(code);

  if (t) {
    if (code) {
      // Try firebase:errors.code
      let localizedMessage = t(`firebase:errors.${code}`);
      if (localizedMessage !== `firebase:errors.${code}`) {
        return localizedMessage;
      }
      // Try auth:code (for legacy or alternate structure)
      localizedMessage = t(`auth:${code.split('/')[1]}`);
      if (localizedMessage !== `auth:${code.split('/')[1]}`) {
        return localizedMessage;
      }
    }
    // Try category fallback
    const categoryMessage = t(`firebase:errors.category.${category}`);
    if (categoryMessage !== `firebase:errors.category.${category}`) {
      return categoryMessage;
    }
  }

  if (code && errorMappings[code]) {
    return errorMappings[code].message;
  }

  return defaultErrorMessages[category];
}

/**
 * Get detailed error information for Firebase errors
 *
 * @param error The error object or string from Firebase
 * @param t Optional translation function (i18n)
 * @returns FirebaseErrorDetails object with message and metadata
 */
export function getFirebaseErrorDetails(error: any, t?: (key: string) => string): FirebaseErrorDetails {
  if (!error) {
    return {
      message: '',
      severity: 'error',
      userFacing: true
    };
  }

  const code = extractErrorCode(error);
  const category = getErrorCategory(code);

  // If we have a mapping for this specific error code
  if (code && errorMappings[code]) {
    const details = { ...errorMappings[code] };

    // Apply localization if available
    if (t) {
      const localizedMessage = t(`firebase.errors.${code}`);
      if (localizedMessage !== `firebase.errors.${code}`) {
        details.message = localizedMessage;
      }
    }

    return details;
  }

  // Default error details by category
  return {
    message: getFirebaseErrorMessage(error, t),
    severity: 'error',
    userFacing: true
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getFirebaseErrorMessage instead
 */
export function getAuthErrorMessage(error: any, t?: (key: string) => string): string {
  return getFirebaseErrorMessage(error, t);
}
