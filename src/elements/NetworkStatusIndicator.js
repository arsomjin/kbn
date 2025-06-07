import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Card, CardBody, Button } from 'shards-react';
import { Typography, Progress, Tag, Space, notification } from 'antd';
import { AnimateKeyframes } from 'react-simple-animate';
import { isMobile } from 'react-device-detect';
import { useNetworkStatus } from 'hooks/useNetworkStatus';

const { Text, Title } = Typography;

const NetworkStatusIndicator = ({ 
  position = 'fixed', 
  showRetryButton = true, 
  autoRetry = true,
  retryInterval = 5000,
  detailedStatus = true,
  showWhenOnline = false,
  onlineMessage = "เชื่อมต่ออินเทอร์เน็ตแล้ว",
  offlineMessage = "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้",
  enableQualityCheck = true,
  autoHideDelay = 3000
}) => {
  const { theme, networkStatus } = useSelector(state => state.global);
  const [showComponent, setShowComponent] = useState(false);
  const [startRef, setStart] = useState(false);
  
  const {
    connectionStatus,
    connectionQuality,
    isOnline,
    isOffline,
    isReconnecting,
    isUnstable,
    connectionLatency,
    downlinkSpeed,
    effectiveType,
    lastOnlineTime,
    isRetrying,
    retryCount,
    retryConnection,
    getQualityText,
    getStatusText,
    CONNECTION_TYPES,
    QUALITY_LEVELS
  } = useNetworkStatus({
    retryInterval,
    autoRetry,
    enableQualityCheck
  });

  // Component visibility logic
  useEffect(() => {
    if (isOffline || isReconnecting || (isUnstable && detailedStatus)) {
      setShowComponent(true);
    } else if (isOnline) {
      if (showWhenOnline) {
        setShowComponent(true);
        // Auto hide after delay if online
        const timer = setTimeout(() => {
          setShowComponent(false);
        }, autoHideDelay);
        return () => clearTimeout(timer);
      } else {
        setShowComponent(false);
      }
    }
  }, [connectionStatus, showWhenOnline, detailedStatus, autoHideDelay, isOffline, isReconnecting, isUnstable, isOnline]);

  // Initial startup delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStart(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show success notification when reconnected
  useEffect(() => {
    if (isOnline && retryCount > 0 && detailedStatus) {
      notification.success({
        message: onlineMessage,
        description: `เชื่อมต่อสำเร็จหลังจากพยายาม ${retryCount} ครั้ง`,
        placement: 'topRight',
        duration: 3,
        style: {
          zIndex: 100002
        }
      });
    }
  }, [isOnline, retryCount, onlineMessage, detailedStatus]);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case CONNECTION_TYPES.ONLINE:
        return connectionQuality === QUALITY_LEVELS.EXCELLENT ? 'wifi' : 'signal_wifi_4_bar';
      case CONNECTION_TYPES.UNSTABLE:
        return 'signal_wifi_bad';
      case CONNECTION_TYPES.RECONNECTING:
        return 'wifi_protected_setup';
      default:
        return 'wifi_off';
    }
  };

  const getConnectionColor = () => {
    if (isOnline) {
      switch (connectionQuality) {
        case QUALITY_LEVELS.EXCELLENT: return '#52c41a';
        case QUALITY_LEVELS.GOOD: return '#1890ff';
        case QUALITY_LEVELS.FAIR: return '#faad14';
        case QUALITY_LEVELS.POOR: return '#ff4d4f';
        default: return theme.colors.success;
      }
    }
    return theme.colors.notification;
  };

  const getDetailedStatusText = () => {
    if (isOnline && detailedStatus) {
      return `${getStatusText()} (${getQualityText()})`;
    }
    return getStatusText();
  };

  const getConnectionDetails = () => {
    const details = [];
    
    if (connectionLatency) {
      details.push(`Ping: ${Math.round(connectionLatency)}ms`);
    }
    
    if (downlinkSpeed) {
      details.push(`Speed: ${downlinkSpeed}Mbps`);
    }
    
    if (effectiveType) {
      details.push(`Type: ${effectiveType.toUpperCase()}`);
    }
    
    return details.join(' • ');
  };

  // Don't render if conditions not met
  if (!showComponent || !startRef) {
    return null;
  }

  const cardStyle = {
    position: position,
    right: isMobile ? 
      `${networkStatus?.position?.mobileRight || 10}px` : 
      `${networkStatus?.position?.right || 20}px`,
    top: isMobile ? 
      `${networkStatus?.position?.mobileTop || 100}px` : 
      `${networkStatus?.position?.top || 140}px`,
    zIndex: 99999, // High z-index to ensure it's above everything
    minWidth: isMobile ? '280px' : '320px',
    maxWidth: isMobile ? '90vw' : '400px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    border: `2px solid ${getConnectionColor()}`,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)'
  };

  const shouldAnimate = isOffline || isReconnecting;

  return (
    <AnimateKeyframes 
      play={shouldAnimate} 
      iterationCount="infinite" 
      duration={isRetrying ? 1 : 3} 
      keyframes={isRetrying ? 
        ['transform: scale(1)', 'transform: scale(1.02)', 'transform: scale(1)'] :
        ['opacity: 0.9', 'opacity: 1']
      }
    >
      <Card style={cardStyle}>
        <CardBody className="p-3">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <i
                className="material-icons"
                style={{
                  fontSize: isMobile ? '24px' : '28px',
                  color: getConnectionColor(),
                  marginRight: '8px',
                  animation: isReconnecting ? 'spin 2s linear infinite' : 'none'
                }}
              >
                {getConnectionIcon()}
              </i>
              <div>
                <Title level={5} className="mb-0" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  {getDetailedStatusText()}
                </Title>
                {detailedStatus && lastOnlineTime && (isOffline || isReconnecting) && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ออนไลน์ครั้งสุดท้าย: {lastOnlineTime.toLocaleTimeString('th-TH')}
                  </Text>
                )}
              </div>
            </div>
            
            <Tag 
              color={isOnline ? 'success' : 'error'}
              style={{ fontSize: '10px' }}
            >
              {isOnline ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
            </Tag>
          </div>

          {/* Connection Details */}
          {detailedStatus && isOnline && (
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '11px', 
                display: 'block', 
                marginBottom: '8px' 
              }}
            >
              {getConnectionDetails()}
            </Text>
          )}

          {/* Progress Bar for Reconnecting */}
          {isReconnecting && (
            <div className="mb-2">
              <Progress 
                percent={Math.min((retryCount * 20), 100)} 
                size="small" 
                status="active"
                format={() => `ลองครั้งที่ ${retryCount + 1}`}
              />
            </div>
          )}

          {/* Status Messages */}
          {detailedStatus && (
            <Text 
              style={{ 
                fontSize: '12px', 
                display: 'block', 
                marginBottom: showRetryButton && (isOffline || isReconnecting) ? '12px' : '0',
                color: theme.colors.text 
              }}
            >
              {isOffline && offlineMessage}
              {isReconnecting && 'กำลังพยายามเชื่อมต่อใหม่อัตโนมัติ...'}
              {isUnstable && 'การเชื่อมต่ออินเทอร์เน็ตไม่เสถียร อาจส่งผลต่อการใช้งาน'}
              {isOnline && connectionQuality === QUALITY_LEVELS.POOR &&
                'การเชื่อมต่อช้า อาจมีการหน่วงในการโหลดข้อมูล'
              }
            </Text>
          )}

          {/* Action Buttons */}
          {showRetryButton && (isOffline || isReconnecting) && (
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

NetworkStatusIndicator.propTypes = {
  position: PropTypes.oneOf(['fixed', 'absolute', 'relative']),
  showRetryButton: PropTypes.bool,
  autoRetry: PropTypes.bool,
  retryInterval: PropTypes.number,
  detailedStatus: PropTypes.bool,
  showWhenOnline: PropTypes.bool,
  onlineMessage: PropTypes.string,
  offlineMessage: PropTypes.string,
  enableQualityCheck: PropTypes.bool,
  autoHideDelay: PropTypes.number,
};

export default NetworkStatusIndicator; 