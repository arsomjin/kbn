import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { goOnline, goOffline } from 'redux/actions/unPersisted';

const CONNECTION_TYPES = {
  ONLINE: 'online',
  OFFLINE: 'offline', 
  RECONNECTING: 'reconnecting',
  UNSTABLE: 'unstable'
};

const QUALITY_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good', 
  FAIR: 'fair',
  POOR: 'poor',
  OFFLINE: 'offline'
};

/**
 * Enhanced network status hook with connection quality detection
 * @param {Object} options - Configuration options
 * @param {number} options.retryInterval - Auto retry interval in ms (default: 5000)
 * @param {boolean} options.autoRetry - Enable auto retry (default: true)
 * @param {number} options.speedTestInterval - Speed test interval in ms (default: 30000)
 * @param {string} options.testEndpoint - Endpoint for speed testing (default: '/favicon.ico')
 * @param {boolean} options.enableQualityCheck - Enable connection quality checking (default: true)
 */
export const useNetworkStatus = (options = {}) => {
  const {
    retryInterval = 5000,
    autoRetry = true,
    speedTestInterval = 30000,
    testEndpoint = '/favicon.ico',
    enableQualityCheck = true
  } = options;

  const dispatch = useDispatch();
  
  // State management
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_TYPES.ONLINE);
  const [connectionQuality, setConnectionQuality] = useState(QUALITY_LEVELS.GOOD);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOnlineTime, setLastOnlineTime] = useState(null);
  const [connectionLatency, setConnectionLatency] = useState(null);
  const [downlinkSpeed, setDownlinkSpeed] = useState(null);
  const [effectiveType, setEffectiveType] = useState(null);

  // Refs for cleanup
  const retryIntervalRef = useRef(null);
  const speedTestIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Network quality detection
  const detectConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      return QUALITY_LEVELS.OFFLINE;
    }

    try {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const startTime = performance.now();
      const response = await fetch(`${testEndpoint}?_=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: abortControllerRef.current.signal
      });
      const endTime = performance.now();
      
      const latency = endTime - startTime;
      setConnectionLatency(latency);

      if (!response.ok) {
        return QUALITY_LEVELS.OFFLINE;
      }

      // Categorize based on latency
      if (latency < 150) return QUALITY_LEVELS.EXCELLENT;
      if (latency < 300) return QUALITY_LEVELS.GOOD;
      if (latency < 600) return QUALITY_LEVELS.FAIR;
      return QUALITY_LEVELS.POOR;

    } catch (error) {
      if (error.name === 'AbortError') {
        return connectionQuality; // Return current quality if aborted
      }
      console.warn('Network quality check failed:', error);
      return QUALITY_LEVELS.OFFLINE;
    }
  }, [testEndpoint, connectionQuality]);

  // Get network information from browser APIs
  const getNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setDownlinkSpeed(connection.downlink);
        setEffectiveType(connection.effectiveType);
        return {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
    }
    return null;
  }, []);

  // Comprehensive connection check
  const checkConnection = useCallback(async () => {
    const browserOnline = navigator.onLine;
    
    if (!browserOnline) {
      setConnectionStatus(CONNECTION_TYPES.OFFLINE);
      setConnectionQuality(QUALITY_LEVELS.OFFLINE);
      return false;
    }

    if (enableQualityCheck) {
      const quality = await detectConnectionQuality();
      setConnectionQuality(quality);
      
      if (quality === QUALITY_LEVELS.OFFLINE) {
        setConnectionStatus(CONNECTION_TYPES.OFFLINE);
        return false;
      }
      
      if (quality === QUALITY_LEVELS.POOR) {
        setConnectionStatus(CONNECTION_TYPES.UNSTABLE);
      } else {
        setConnectionStatus(CONNECTION_TYPES.ONLINE);
      }
    } else {
      setConnectionStatus(CONNECTION_TYPES.ONLINE);
      setConnectionQuality(QUALITY_LEVELS.GOOD);
    }

    // Get additional network info
    getNetworkInfo();
    
    return true;
  }, [detectConnectionQuality, enableQualityCheck, getNetworkInfo]);

  // Manual retry connection
  const retryConnection = useCallback(async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setConnectionStatus(CONNECTION_TYPES.RECONNECTING);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        setRetryCount(0);
        setLastOnlineTime(new Date());
        dispatch(goOnline());
        return { success: true, message: 'Connected successfully' };
      } else {
        setRetryCount(prev => prev + 1);
        dispatch(goOffline());
        return { success: false, message: 'Connection failed' };
      }
    } catch (error) {
      setRetryCount(prev => prev + 1);
      dispatch(goOffline());
      return { success: false, message: error.message };
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, checkConnection, dispatch]);

  // Auto retry mechanism
  useEffect(() => {
    if (autoRetry && connectionStatus === CONNECTION_TYPES.OFFLINE && !isRetrying) {
      retryIntervalRef.current = setInterval(() => {
        retryConnection();
      }, retryInterval);
    } else {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    }

    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, [connectionStatus, autoRetry, retryInterval, retryConnection, isRetrying]);

  // Periodic speed test when online
  useEffect(() => {
    if (connectionStatus === CONNECTION_TYPES.ONLINE && enableQualityCheck) {
      speedTestIntervalRef.current = setInterval(async () => {
        const quality = await detectConnectionQuality();
        setConnectionQuality(quality);
        getNetworkInfo();
      }, speedTestInterval);
    } else {
      if (speedTestIntervalRef.current) {
        clearInterval(speedTestIntervalRef.current);
        speedTestIntervalRef.current = null;
      }
    }

    return () => {
      if (speedTestIntervalRef.current) {
        clearInterval(speedTestIntervalRef.current);
      }
    };
  }, [connectionStatus, enableQualityCheck, detectConnectionQuality, getNetworkInfo, speedTestInterval]);

  // Browser online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setLastOnlineTime(new Date());
      checkConnection();
    };
    
    const handleOffline = () => {
      setConnectionStatus(CONNECTION_TYPES.OFFLINE);
      setConnectionQuality(QUALITY_LEVELS.OFFLINE);
      dispatch(goOffline());
    };

    // Network change listeners
    const handleConnectionChange = () => {
      getNetworkInfo();
      if (navigator.onLine) {
        checkConnection();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for network changes
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    // Initial check
    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);  
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }
      
      // Cleanup intervals
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      if (speedTestIntervalRef.current) {
        clearInterval(speedTestIntervalRef.current);
      }
      
      // Abort pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkConnection, dispatch, getNetworkInfo]);

  // Helper functions
  const isOnline = connectionStatus === CONNECTION_TYPES.ONLINE;
  const isOffline = connectionStatus === CONNECTION_TYPES.OFFLINE;
  const isReconnecting = connectionStatus === CONNECTION_TYPES.RECONNECTING;
  const isUnstable = connectionStatus === CONNECTION_TYPES.UNSTABLE;

  const getQualityText = (quality = connectionQuality, lang = 'th') => {
    const texts = {
      th: {
        [QUALITY_LEVELS.EXCELLENT]: 'ดีเยี่ยม',
        [QUALITY_LEVELS.GOOD]: 'ดี', 
        [QUALITY_LEVELS.FAIR]: 'ปานกลาง',
        [QUALITY_LEVELS.POOR]: 'ช้า',
        [QUALITY_LEVELS.OFFLINE]: 'ออฟไลน์'
      },
      en: {
        [QUALITY_LEVELS.EXCELLENT]: 'Excellent',
        [QUALITY_LEVELS.GOOD]: 'Good',
        [QUALITY_LEVELS.FAIR]: 'Fair', 
        [QUALITY_LEVELS.POOR]: 'Poor',
        [QUALITY_LEVELS.OFFLINE]: 'Offline'
      }
    };
    return texts[lang][quality] || quality;
  };

  const getStatusText = (status = connectionStatus, lang = 'th') => {
    const texts = {
      th: {
        [CONNECTION_TYPES.ONLINE]: 'ออนไลน์',
        [CONNECTION_TYPES.OFFLINE]: 'ออฟไลน์',
        [CONNECTION_TYPES.RECONNECTING]: 'กำลังเชื่อมต่อใหม่...',
        [CONNECTION_TYPES.UNSTABLE]: 'การเชื่อมต่อไม่เสถียร'
      },
      en: {
        [CONNECTION_TYPES.ONLINE]: 'Online',
        [CONNECTION_TYPES.OFFLINE]: 'Offline', 
        [CONNECTION_TYPES.RECONNECTING]: 'Reconnecting...',
        [CONNECTION_TYPES.UNSTABLE]: 'Unstable Connection'
      }
    };
    return texts[lang][status] || status;
  };

  return {
    // Status
    connectionStatus,
    connectionQuality,
    isOnline,
    isOffline,
    isReconnecting,
    isUnstable,
    
    // Connection info
    connectionLatency,
    downlinkSpeed,
    effectiveType,
    lastOnlineTime,
    
    // Retry info
    isRetrying,
    retryCount,
    
    // Actions
    retryConnection,
    checkConnection,
    
    // Helpers
    getQualityText,
    getStatusText,
    
    // Constants
    CONNECTION_TYPES,
    QUALITY_LEVELS
  };
};

export default useNetworkStatus; 