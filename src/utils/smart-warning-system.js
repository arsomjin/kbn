/**
 * Smart Warning System
 * Reduces warning spam while maintaining useful debugging information
 */

// Track warnings to prevent spam
const warningTracker = new Map();
const WARNING_COOLDOWN = 30000; // 30 seconds between same warnings
const MAX_WARNINGS_PER_TYPE = 5; // Max warnings per type per session

/**
 * Smart warning that prevents spam
 * @param {string} type - Warning type/category
 * @param {string} message - Warning message
 * @param {Object} data - Additional data to log
 * @param {Object} options - Warning options
 */
export const smartWarn = (type, message, data = {}, options = {}) => {
  const {
    cooldown = WARNING_COOLDOWN,
    maxCount = MAX_WARNINGS_PER_TYPE,
    alwaysLog = false,
    level = 'warn' // 'warn', 'info', 'error'
  } = options;

  const warningKey = `${type}:${message}`;
  const now = Date.now();
  
  // Get or create warning entry
  if (!warningTracker.has(warningKey)) {
    warningTracker.set(warningKey, {
      count: 0,
      lastShown: 0,
      firstSeen: now,
      data: []
    });
  }
  
  const warning = warningTracker.get(warningKey);
  warning.count++;
  warning.data.push({ timestamp: now, ...data });
  
  // Check if we should show this warning
  const shouldShow = alwaysLog || 
                    warning.count <= maxCount || 
                    (now - warning.lastShown) > cooldown;
  
  if (shouldShow) {
    warning.lastShown = now;
    
    // Create enhanced message
    const enhancedMessage = warning.count > 1 ? 
      `${message} (${warning.count}x in ${Math.round((now - warning.firstSeen) / 1000)}s)` : 
      message;
    
    // Log based on level
    switch (level) {
      case 'error':
        console.error(`🚨 ${type}:`, enhancedMessage, data);
        break;
      case 'info':
        console.info(`ℹ️ ${type}:`, enhancedMessage, data);
        break;
      default:
        console.warn(`⚠️ ${type}:`, enhancedMessage, data);
    }
    
    // Show summary if this is a repeated warning
    if (warning.count > maxCount && (now - warning.lastShown) > cooldown) {
      console.groupCollapsed(`📊 ${type} Summary (${warning.count} total)`);
      console.log('First seen:', new Date(warning.firstSeen));
      console.log('Total occurrences:', warning.count);
      console.log('Recent data samples:', warning.data.slice(-3));
      console.groupEnd();
    }
  }
  
  return warning.count;
};

/**
 * Smart RBAC migration warning
 * Replaces the spammy migration warnings with smarter ones
 */
export const smartRBACWarn = (user, context = '') => {
  if (!user) return;
  
  const hasCleanSlate = !!(user.access?.authority);
  
  if (!hasCleanSlate) {
    smartWarn(
      'RBAC_MIGRATION',
      'User needs migration to Clean Slate RBAC format',
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        context,
        hasUserRBAC: !!user.userRBAC,
        hasAuth: !!user.auth
      },
      {
        maxCount: 3, // Only show 3 times per user
        cooldown: 60000, // 1 minute cooldown
        level: 'info'
      }
    );
  }
};

/**
 * Smart permission warning
 * For permission-related warnings
 */
export const smartPermissionWarn = (permission, user, context = '') => {
  smartWarn(
    'PERMISSION_CHECK',
    `Permission check failed: ${permission}`,
    {
      permission,
      uid: user?.uid,
      authority: user?.access?.authority,
      context
    },
    {
      maxCount: 2,
      cooldown: 30000
    }
  );
};

/**
 * Smart auth warning
 * For authentication-related warnings
 */
export const smartAuthWarn = (message, data = {}) => {
  smartWarn(
    'AUTH_SYSTEM',
    message,
    data,
    {
      maxCount: 3,
      cooldown: 45000,
      level: 'warn'
    }
  );
};

/**
 * Get warning statistics
 * Useful for debugging and monitoring
 */
export const getWarningStats = () => {
  const stats = {
    totalTypes: warningTracker.size,
    totalWarnings: 0,
    byType: {},
    recent: []
  };
  
  const now = Date.now();
  const recentThreshold = now - 300000; // Last 5 minutes
  
  warningTracker.forEach((warning, key) => {
    const [type] = key.split(':');
    
    stats.totalWarnings += warning.count;
    
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, warnings: [] };
    }
    
    stats.byType[type].count += warning.count;
    stats.byType[type].warnings.push({
      message: key.split(':').slice(1).join(':'),
      count: warning.count,
      firstSeen: warning.firstSeen,
      lastShown: warning.lastShown
    });
    
    // Collect recent warnings
    const recentData = warning.data.filter(d => d.timestamp > recentThreshold);
    if (recentData.length > 0) {
      stats.recent.push({
        type,
        key,
        count: recentData.length,
        latest: recentData[recentData.length - 1]
      });
    }
  });
  
  return stats;
};

/**
 * Clear warning history
 * Useful for testing or resetting
 */
export const clearWarnings = (type = null) => {
  if (type) {
    // Clear specific type
    const keysToDelete = [];
    warningTracker.forEach((_, key) => {
      if (key.startsWith(`${type}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => warningTracker.delete(key));
  } else {
    // Clear all
    warningTracker.clear();
  }
};

/**
 * Enhanced console methods that use smart warnings
 */
export const smartConsole = {
  rbacWarn: smartRBACWarn,
  permissionWarn: smartPermissionWarn,
  authWarn: smartAuthWarn,
  warn: (type, message, data, options) => smartWarn(type, message, data, { level: 'warn', ...options }),
  info: (type, message, data, options) => smartWarn(type, message, data, { level: 'info', ...options }),
  error: (type, message, data, options) => smartWarn(type, message, data, { level: 'error', ...options }),
  stats: getWarningStats,
  clear: clearWarnings
};

// Auto-setup in development
if (process.env.NODE_ENV === 'development') {
  // Make available globally for debugging
  window.smartConsole = smartConsole;
  
  console.log('🔧 Smart Warning System loaded');
  console.log('📊 Use smartConsole.stats() to see warning statistics');
  console.log('🧹 Use smartConsole.clear() to reset warnings');
} 