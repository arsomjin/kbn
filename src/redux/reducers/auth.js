import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  VERIFY_REQUEST,
  VERIFY_SUCCESS,
  USER_UPDATE
} from '../actions/auth';

/**
 * Helper function to validate Clean Slate user structure
 * @param {Object} user - User object to validate
 * @returns {boolean} - True if valid Clean Slate structure
 */
const isValidCleanSlateUser = (user) => {
  return !!(
    user?.access?.authority && 
    user?.access?.geographic && 
    Array.isArray(user?.access?.departments)
  );
};

/**
 * Helper function to ensure user has Clean Slate structure
 * @param {Object} user - User object
 * @returns {Object} - User with Clean Slate validation flag
 */
const validateUserStructure = (user) => {
  if (!user || typeof user !== 'object') {
    return { ...user, isValidCleanSlate: false };
  }

  const isValid = isValidCleanSlateUser(user);
  
  if (!isValid && user?.uid) {
    console.warn('🚨 Auth Reducer: User missing Clean Slate RBAC structure:', user);
    console.warn('⚠️ User needs migration to user.access.* format');
  }

  return {
    ...user,
    isValidCleanSlate: isValid,
    structureValidatedAt: Date.now()
  };
};

const initialState = {
  // Authentication state
  isLoggingIn: false,
  isLoggingOut: false,
  isVerifying: false,
  isAuthenticated: false,
  
  // Error states
  signUpError: null,
  loginError: null,
  logoutError: null,
  resetPasswordError: null,
  verifyingError: null,
  
  // User data (Clean Slate structure)
  user: {},
  
  // Registration flow
  registrationPending: false,
  registrationData: null,
  
  // Clean Slate validation
  userStructureValid: false,
  migrationRequired: false,
  
  // Session management
  sessionExpiry: null,
  lastActivity: null,
  
  // Metadata
  lastUpdated: null
};

const resetState = {
  ...initialState,
  user: {},
  isAuthenticated: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
        signUpError: null,
        lastActivity: Date.now()
      };

    case SIGNUP_SUCCESS: {
      const validatedUser = validateUserStructure(action.user);
      
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: true,
        signUpError: null,
        user: validatedUser,
        userStructureValid: validatedUser.isValidCleanSlate,
        migrationRequired: !validatedUser.isValidCleanSlate,
        lastUpdated: Date.now(),
        lastActivity: Date.now()
      };
    }

    case SIGNUP_FAILURE:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: false,
        signUpError: action.error,
        user: {},
        userStructureValid: false,
        migrationRequired: false,
        lastActivity: Date.now()
      };

    case LOGIN_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
        loginError: null,
        lastActivity: Date.now()
      };

    case LOGIN_SUCCESS: {
      const validatedUser = validateUserStructure(action.user);
      
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: true,
        loginError: null,
        user: validatedUser,
        userStructureValid: validatedUser.isValidCleanSlate,
        migrationRequired: !validatedUser.isValidCleanSlate,
        registrationPending: false,
        registrationData: null,
        lastUpdated: Date.now(),
        lastActivity: Date.now()
      };
    }

    case LOGIN_FAILURE:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: false,
        loginError: action.error,
        user: {},
        userStructureValid: false,
        migrationRequired: false,
        lastActivity: Date.now()
      };

    case LOGOUT_REQUEST:
      return {
        ...state,
        isLoggingOut: true,
        logoutError: null,
        lastActivity: Date.now()
      };

    case LOGOUT_SUCCESS:
      return {
        ...resetState,
        isLoggingOut: false,
        lastActivity: Date.now()
      };

    case LOGOUT_FAILURE:
      return {
        ...state,
        isLoggingOut: false,
        logoutError: action.error,
        lastActivity: Date.now()
      };

    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
        resetPasswordError: null,
        lastActivity: Date.now()
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        resetPasswordError: null,
        lastActivity: Date.now()
      };

    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: false,
        resetPasswordError: action.error,
        lastActivity: Date.now()
      };

    case VERIFY_REQUEST:
      return {
        ...state,
        isVerifying: true,
        verifyingError: null,
        lastActivity: Date.now()
      };

    case VERIFY_SUCCESS:
      return {
        ...state,
        isVerifying: false,
        isLoggingIn: false,
        loginError: null,
        logoutError: null,
        signUpError: null,
        resetPasswordError: null,
        verifyingError: null,
        lastActivity: Date.now()
      };

    case USER_UPDATE: {
      const validatedUser = validateUserStructure(action.user);
      
      return {
        ...state,
        user: validatedUser,
        userStructureValid: validatedUser.isValidCleanSlate,
        migrationRequired: !validatedUser.isValidCleanSlate,
        lastUpdated: Date.now(),
        lastActivity: Date.now()
      };
    }

    case 'REGISTRATION_PENDING': {
      const validatedUser = validateUserStructure(action.userData);
      
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: true, // User IS authenticated, just pending approval
        signUpError: null,
        registrationPending: true,
        registrationData: validatedUser,
        user: validatedUser,
        userStructureValid: validatedUser.isValidCleanSlate,
        migrationRequired: !validatedUser.isValidCleanSlate,
        lastUpdated: Date.now(),
        lastActivity: Date.now()
      };
    }

    case 'CLEAR_REGISTRATION_PENDING':
      return {
        ...state,
        registrationPending: false,
        registrationData: null,
        lastActivity: Date.now()
      };

    case 'CLEAN_SLATE_MIGRATION_COMPLETE': {
      const { migratedUser } = action.payload;
      const validatedUser = validateUserStructure(migratedUser);
      
      return {
        ...state,
        user: validatedUser,
        userStructureValid: true,
        migrationRequired: false,
        lastUpdated: Date.now(),
        lastActivity: Date.now()
      };
    }

    case 'SESSION_ACTIVITY_UPDATE':
      return {
        ...state,
        lastActivity: Date.now(),
        sessionExpiry: action.payload?.sessionExpiry || state.sessionExpiry
      };

    case 'CLEAR_AUTH_ERRORS':
      return {
        ...state,
        signUpError: null,
        loginError: null,
        logoutError: null,
        resetPasswordError: null,
        verifyingError: null
      };

    default:
      return state;
  }
}

// Selectors for Clean Slate validation
export const getUser = (state) => state.auth.user;
export const isUserAuthenticated = (state) => state.auth.isAuthenticated;
export const isUserStructureValid = (state) => state.auth.userStructureValid;
export const doesUserNeedMigration = (state) => state.auth.migrationRequired;
export const getUserLastActivity = (state) => state.auth.lastActivity;
export const getAuthErrors = (state) => ({
  signUp: state.auth.signUpError,
  login: state.auth.loginError,
  logout: state.auth.logoutError,
  resetPassword: state.auth.resetPasswordError,
  verifying: state.auth.verifyingError
});

// Clean Slate user access helpers
export const getUserAccess = (state) => state.auth.user?.access || null;
export const getUserAuthority = (state) => state.auth.user?.access?.authority || null;
export const getUserGeographicScope = (state) => state.auth.user?.access?.geographic?.scope || null;
export const getUserDepartments = (state) => state.auth.user?.access?.departments || [];
export const isCleanSlateUser = (state) => isValidCleanSlateUser(state.auth.user);
