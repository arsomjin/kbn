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

const initialState = {
  isLoggingIn: false,
  isLoggingOut: false,
  isVerifying: false,
  signUpError: null,
  loginError: null,
  logoutError: null,
  resetPasswordError: null,
  isAuthenticated: false,
  user: {}
};

const resetState = initialState;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
        signUpError: null
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: true,
        signUpError: null,
        user: action.user
      };
    case SIGNUP_FAILURE:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: false,
        signUpError: action.error
      };
    case LOGIN_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
        loginError: null
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: true,
        loginError: null,
        user: action.user
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: false,
        loginError: action.error
      };
    case LOGOUT_REQUEST:
      return {
        ...state,
        isLoggingOut: true,
        logoutError: null
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isLoggingOut: false,
        isAuthenticated: false,
        logoutError: null,
        user: {}
      };
    case LOGOUT_FAILURE:
      return {
        ...state,
        isLoggingOut: false,
        logoutError: action.error
      };
    case RESET_PASSWORD_REQUEST:
      return {
        ...state,
        isLoggingIn: true,
        resetPasswordError: null
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        resetPasswordError: null
      };
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        isLoggingIn: false,
        isAuthenticated: false,
        resetPasswordError: action.error
      };
    case VERIFY_REQUEST:
      return {
        ...state,
        isVerifying: true,
        verifyingError: null
      };
    case VERIFY_SUCCESS:
      return {
        ...state,
        isVerifying: false,
        isLoggingIn: false,
        loginError: null,
        logoutError: null,
        signUpError: null,
        resetPasswordError: null
      };
    case USER_UPDATE:
      return {
        ...state,
        user: action.user
      };
    default:
      return state;
  }
}
