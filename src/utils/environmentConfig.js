// Environment Configuration Utility
// Centralized configuration management for database switching

const safeEnv = (typeof process !== 'undefined' && process.env) || {};

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export const ENVIRONMENTS = {
  TEST: 'test',
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
};

export const getCurrentEnvironment = () => {
  const projectId = safeEnv.REACT_APP_FIREBASE_PROJECT_ID;
  const nodeEnv = safeEnv.NODE_ENV;
  
  // Determine environment based on project ID
  if (projectId?.includes('test') || projectId?.includes('dev')) {
    return ENVIRONMENTS.TEST;
  } else if (nodeEnv === 'production' && projectId) {
    return ENVIRONMENTS.PRODUCTION;
  }
  return ENVIRONMENTS.DEVELOPMENT;
};

export const getDatabaseInfo = () => {
  const env = getCurrentEnvironment();
  const projectId = safeEnv.REACT_APP_FIREBASE_PROJECT_ID || 'unknown';
  
  return {
    environment: env,
    projectId,
    isProduction: env === ENVIRONMENTS.PRODUCTION,
    isDevelopment: env === ENVIRONMENTS.DEVELOPMENT
  };
};

export const validateProductionSwitch = () => {
  const { isProduction, projectId } = getDatabaseInfo();
  
  if (isProduction) {
    return {
      isValid: true,
      warnings: [
        '🔴 PRODUCTION DATABASE DETECTED',
        '🔴 All operations will affect live data',
        '🔴 Ensure backup is completed before proceeding'
      ]
    };
  }
  
  return {
    isValid: false,
    warnings: [
      `⚠️ Currently connected to: ${projectId}`,
      '⚠️ Not production environment'
    ]
  };
};

// Migration safety checks
export const getMigrationSafetyConfig = () => {
  const { isProduction } = getDatabaseInfo();
  
  return {
    requiresConfirmation: isProduction,
    maxBatchSize: isProduction ? 10 : 100, // Slower batches in production
    enableDebugLogging: !isProduction,
    requiresBackup: isProduction
  };
};

export {
  isDev,
  isProd
}; 