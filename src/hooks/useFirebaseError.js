import { useState, useCallback } from 'react';
import { message } from 'antd';
import FirebaseErrorHandler from '../utils/firebaseErrorHandler';

/**
 * Custom hook for handling Firebase errors
 * Provides error state management and display utilities
 */
const useFirebaseError = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Firebase error and display user-friendly message
   * @param {Error|Object} firebaseError - Firebase error object
   * @param {Object} options - Options for error handling
   * @param {boolean} options.showMessage - Show toast message (default: true)
   * @param {boolean} options.logError - Log error to console (default: true)
   * @param {Function} options.onError - Custom error handler callback
   */
  const handleError = useCallback((firebaseError, options = {}) => {
    const {
      showMessage: shouldShowMessage = true,
      logError = true,
      onError
    } = options;

    if (!firebaseError) {
      setError(null);
      return null;
    }

    // Interpret the error
    const errorInfo = FirebaseErrorHandler.interpret(firebaseError);
    
    if (logError) {
      console.error('🚨 Firebase Error:', {
        error: firebaseError,
        interpreted: errorInfo
      });
    }

    // Set error state
    setError(errorInfo);

    // Show toast message if enabled
    if (shouldShowMessage) {
      if (errorInfo.severity === 'critical') {
        message.error(errorInfo.message, 8); // Show longer for critical errors
      } else if (errorInfo.severity === 'warning') {
        message.warning(errorInfo.message, 6);
      } else if (errorInfo.severity === 'info') {
        message.info(errorInfo.message, 4);
      } else {
        message.error(errorInfo.message, 6);
      }
    }

    // Call custom error handler if provided
    if (onError && typeof onError === 'function') {
      onError(errorInfo, firebaseError);
    }

    return errorInfo;
  }, []);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute async Firebase operation with error handling
   * @param {Function} operation - Async operation to execute
   * @param {Object} options - Error handling options
   */
  const executeWithErrorHandling = useCallback(async (operation, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await operation();
      return result;
    } catch (error) {
      const errorInfo = handleError(error, options);
      throw errorInfo; // Re-throw the interpreted error
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Check if current error requires re-authentication
   */
  const requiresReauth = useCallback(() => {
    if (!error) return false;
    return FirebaseErrorHandler.requiresReauth(error.code);
  }, [error]);

  /**
   * Check if current error is a network error
   */
  const isNetworkError = useCallback(() => {
    if (!error) return false;
    return FirebaseErrorHandler.isNetworkError(error.code);
  }, [error]);

  /**
   * Get suggested action for current error
   */
  const getSuggestedAction = useCallback(() => {
    if (!error) return null;
    return FirebaseErrorHandler.getSuggestedAction(error.code);
  }, [error]);

  return {
    // State
    error,
    isLoading,
    
    // Error information
    requiresReauth,
    isNetworkError,
    getSuggestedAction,
    
    // Actions
    handleError,
    clearError,
    executeWithErrorHandling
  };
};

export default useFirebaseError; 