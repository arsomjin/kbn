import React, { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardBody, Button } from 'shards-react';
import { Typography, Progress, Tag, Space, notification } from 'antd';
import { AnimateKeyframes } from 'react-simple-animate';
import { isMobile } from 'react-device-detect';
import { goOnline, goOffline } from 'redux/actions/unPersisted';

const { Text, Title } = Typography;

const CONNECTION_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  RECONNECTING: 'reconnecting',
  UNSTABLE: 'unstable'
};

const NoWifi = ({ 
  position = 'fixed', 
  showRetryButton = true, 
  autoRetry = true,
  retryInterval = 5000,
  detailedStatus = true,
  onlineMessage = "เชื่อมต่ออินเทอร์เน็ตแล้ว",
  offlineMessage = "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้"
}) => {
  const dispatch = useDispatch();
  const { isOnline } = useSelector(state => state.unPersisted);
  const { theme } = useSelector(state => state.global);
  
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.ONLINE);
  const [showOffline, setShowOffline] = useState(false);
  const [startRef, setStart] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOnlineTime, setLastOnlineTime] = useState(null);
  const [connectionSpeed, setConnectionSpeed] = useState('good');
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retryIntervalRef = useRef(null);
  const speedTestRef = useRef(null);
  const reconnectionTimeRef = useRef(null);

  // Network quality detection
  const detectConnectionSpeed = useCallback(async () => {
    if (!navigator.onLine) return 'offline';
    
    try {
      const startTime = Date.now();
      const response = await fetch('/favicon.ico?_=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store'
      });
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (latency < 200) return 'excellent';
      if (latency < 500) return 'good';
      if (latency < 1000) return 'fair';
      return 'poor';
    } catch (error) {
      return 'offline';
    }
  }, []);

  // Enhanced connection check
  const checkConnection = useCallback(async () => {
    const browserOnline = navigator.onLine;
    const speed = await detectConnectionSpeed();
    
    if (!browserOnline || speed === 'offline') {
      setConnectionStatus(CONNECTION_STATUS.OFFLINE);
      setConnectionSpeed('offline');
      return false;
    }
    
    setConnectionSpeed(speed);
    
    if (speed === 'poor') {
      setConnectionStatus(CONNECTION_STATUS.UNSTABLE);
    } else {
      setConnectionStatus(CONNECTION_STATUS.ONLINE);
    }
    
    return true;
  }, [detectConnectionSpeed]);

  // Retry connection
  const retryConnection = useCallback(async () => {
    setIsRetrying(true);
    setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
    
    try {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        setRetryCount(0);
        setLastOnlineTime(new Date());
        dispatch(goOnline());
        
        if (detailedStatus) {
          notification.success({
            message: onlineMessage,
            description: `เชื่อมต่อสำเร็จหลังจากพยายาม ${retryCount + 1} ครั้ง`,
            placement: 'topRight',
            duration: 3,
            style: {
              zIndex: 100002
            }
          });
        }
      } else {
        setRetryCount(prev => prev + 1);
        dispatch(goOffline());
      }
    } catch (error) {
      setRetryCount(prev => prev + 1);
      dispatch(goOffline());
    } finally {
      setIsRetrying(false);
    }
  }, [checkConnection, dispatch, retryCount, onlineMessage, detailedStatus]);

  // Auto retry mechanism
  useEffect(() => {
    if (autoRetry && connectionStatus === CONNECTION_STATUS.OFFLINE && !isRetrying) {
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

  // Monitor connection status
  const checkOffline = useCallback(async (isOn) => {
    if (isOn) {
      setShowOffline(false);
      setLastOnlineTime(new Date());
      setRetryCount(0);
      setConnectionStatus(CONNECTION_STATUS.ONLINE);
    } else {
      await checkConnection();
      setShowOffline(true);
    }
  }, [checkConnection]);

  // Initialize component
  useEffect(() => {
    checkOffline(isOnline);
    
    // Add browser online/offline listeners
    const handleOnline = () => {
      checkConnection();
    };
    
    const handleOffline = () => {
      setConnectionStatus(CONNECTION_STATUS.OFFLINE);
      dispatch(goOffline());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial delay to avoid flash on app start
    const timer = setTimeout(() => {
      setStart(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      if (speedTestRef.current) {
        clearInterval(speedTestRef.current);
      }
    };
  }, [checkOffline, isOnline, checkConnection, dispatch]);

  // Periodic speed test when online
  useEffect(() => {
    if (connectionStatus === CONNECTION_STATUS.ONLINE) {
      speedTestRef.current = setInterval(() => {
        detectConnectionSpeed().then(setConnectionSpeed);
      }, 30000); // Test every 30 seconds
    } else {
      if (speedTestRef.current) {
        clearInterval(speedTestRef.current);
        speedTestRef.current = null;
      }
    }

    return () => {
      if (speedTestRef.current) {
        clearInterval(speedTestRef.current);
      }
    };
  }, [connectionStatus, detectConnectionSpeed]);

  // Connection quality indicator
  const getConnectionQualityColor = (speed) => {
    switch (speed) {
      case 'excellent': return '#52c41a';
      case 'good': return '#1890ff';
      case 'fair': return '#faad14';
      case 'poor': return '#ff4d4f';
      default: return theme.colors.notification;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.ONLINE:
        return connectionSpeed === 'excellent' ? 'wifi' : 'signal_wifi_4_bar';
      case CONNECTION_STATUS.UNSTABLE:
        return 'signal_wifi_bad';
      case CONNECTION_STATUS.RECONNECTING:
        return 'wifi_protected_setup';
      default:
        return 'wifi_off';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.ONLINE:
        return detailedStatus ? `ออนไลน์ (${connectionSpeed === 'excellent' ? 'ดีเยี่ยม' : 
               connectionSpeed === 'good' ? 'ดี' : 
               connectionSpeed === 'fair' ? 'ปานกลาง' : 'ช้า'})` : 'ออนไลน์';
      case CONNECTION_STATUS.UNSTABLE:
        return 'การเชื่อมต่อไม่เสถียร';
      case CONNECTION_STATUS.RECONNECTING:
        return 'กำลังเชื่อมต่อใหม่...';
      default:
        return 'ออฟไลน์';
    }
  };

  // Don't show if online and should be hidden
  if (connectionStatus === CONNECTION_STATUS.ONLINE && !detailedStatus) {
    return null;
  }

  if (!showOffline && connectionStatus === CONNECTION_STATUS.ONLINE) {
    return null;
  }

  if (!startRef) {
    return null;
  }

  const cardStyle = {
    position: position,
    right: isMobile ? '10px' : '20px',
    top: isMobile ? '100px' : '140px', // Increased to clear the top navigation bar
    zIndex: 99999, // Increased z-index to ensure it's above everything
    minWidth: isMobile ? '280px' : '320px',
    maxWidth: isMobile ? '90vw' : '400px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    border: `2px solid ${connectionStatus === CONNECTION_STATUS.ONLINE ? 
      getConnectionQualityColor(connectionSpeed) : theme.colors.notification}`,
  };

  const isOfflineStatus = [CONNECTION_STATUS.OFFLINE, CONNECTION_STATUS.RECONNECTING].includes(connectionStatus);

  return (
    <AnimateKeyframes 
      play={isOfflineStatus} 
      iterationCount="infinite" 
      duration={isRetrying ? 1 : 3} 
      keyframes={isRetrying ? 
        ['transform: scale(1)', 'transform: scale(1.02)', 'transform: scale(1)'] :
        ['opacity: 0.9', 'opacity: 1']
      }
    >
      <Card style={cardStyle}>
        <CardBody className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <i
                className="material-icons"
                style={{
                  fontSize: isMobile ? '24px' : '28px',
                  color: connectionStatus === CONNECTION_STATUS.ONLINE ? 
                    getConnectionQualityColor(connectionSpeed) : theme.colors.notification,
                  marginRight: '8px',
                  animation: connectionStatus === CONNECTION_STATUS.RECONNECTING ? 
                    'spin 2s linear infinite' : 'none'
                }}
              >
                {getConnectionIcon()}
              </i>
              <div>
                <Title level={5} className="mb-0" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  {getStatusText()}
                </Title>
                {detailedStatus && lastOnlineTime && isOfflineStatus && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ออนไลน์ครั้งสุดท้าย: {lastOnlineTime.toLocaleTimeString('th-TH')}
                  </Text>
                )}
              </div>
            </div>
            
            <Tag 
              color={connectionStatus === CONNECTION_STATUS.ONLINE ? 'success' : 'error'}
              style={{ fontSize: '10px' }}
            >
              {connectionStatus === CONNECTION_STATUS.ONLINE ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
            </Tag>
          </div>

          {detailedStatus && (
            <>
              {/* Connection Progress */}
              {connectionStatus === CONNECTION_STATUS.RECONNECTING && (
                <div className="mb-2">
                  <Progress 
                    percent={Math.min((retryCount * 20), 100)} 
                    size="small" 
                    status="active"
                    format={() => `ลองครั้งที่ ${retryCount + 1}`}
                  />
                </div>
              )}

              {/* Status Message */}
              <Text 
                style={{ 
                  fontSize: '12px', 
                  display: 'block', 
                  marginBottom: '12px',
                  color: theme.colors.text 
                }}
              >
                {connectionStatus === CONNECTION_STATUS.OFFLINE && 
                  offlineMessage
                }
                {connectionStatus === CONNECTION_STATUS.RECONNECTING && 
                  'กำลังพยายามเชื่อมต่อใหม่อัตโนมัติ...'
                }
                {connectionStatus === CONNECTION_STATUS.UNSTABLE && 
                  'การเชื่อมต่ออินเทอร์เน็ตไม่เสถียร อาจส่งผลต่อการใช้งาน'
                }
                {connectionStatus === CONNECTION_STATUS.ONLINE && connectionSpeed === 'poor' &&
                  'การเชื่อมต่อช้า อาจมีการหน่วงในการโหลดข้อมูล'
                }
              </Text>
            </>
          )}

          {/* Action Buttons */}
          {showRetryButton && isOfflineStatus && (
            <Space>
              <Button 
                size="sm" 
                theme="primary" 
                disabled={isRetrying}
                onClick={retryConnection}
                style={{ fontSize: '12px' }}
              >
                {isRetrying ? 'กำลังลองใหม่...' : 'ลองใหม่'}
              </Button>
              {retryCount > 0 && (
                <Text style={{ fontSize: '11px', color: theme.colors.textSecondary }}>
                  พยายามแล้ว {retryCount} ครั้ง
                </Text>
              )}
            </Space>
          )}
        </CardBody>
      </Card>
    </AnimateKeyframes>
  );
};

NoWifi.propTypes = {
  position: PropTypes.oneOf(['fixed', 'absolute', 'relative']),
  showRetryButton: PropTypes.bool,
  autoRetry: PropTypes.bool,
  retryInterval: PropTypes.number,
  detailedStatus: PropTypes.bool,
  onlineMessage: PropTypes.string,
  offlineMessage: PropTypes.string,
};

export default NoWifi;
