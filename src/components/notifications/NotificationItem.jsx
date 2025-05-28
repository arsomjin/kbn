import React from 'react';
import { List, Tag, Typography, Button, Avatar, Space, Tooltip, Badge } from 'antd';
import {
  CheckOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  FireOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { formatRelativeTime } from '../../utils/timestampUtils';
import './NotificationList.css';

const { Text, Paragraph } = Typography;

/**
 * NotificationItem Component
 * Displays individual notification with proper styling, accessibility, and actions
 */
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onNotificationClick,
  compact,
}) => {
  const { t } = useTranslation(
    ['notifications', 'common', 'roles', 'userRoleManager', 'userReview'],
    {
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    },
  );
  const { isDarkMode } = useTheme();

  // Safe translation function with fallback
  const safeT = (key, defaultValue = key, options = {}) => {
    try {
      const translated = t(key, options);
      // If the translation is the same as the key, it might not be found
      if (translated === key && defaultValue !== key) {
        return defaultValue;
      }
      return translated;
    } catch {
      console.warn(`Translation key not found: ${key}`);
      return defaultValue || key;
    }
  };

  // Smart translation function that can handle both translation keys and raw text
  const translateContent = (content, fallback = '') => {
    if (!content) return fallback;

    // If the content looks like a translation key (contains dots and no spaces/special chars)
    if (typeof content === 'string' && content.includes('.') && !/\s/.test(content)) {
      // Try to translate it
      const translated = safeT(content, content);

      // If translation was successful (different from the key), return it
      if (translated !== content) {
        return translated;
      }

      // If it starts with 'notifications.', try translating with notifications namespace
      if (content.startsWith('notifications.')) {
        const keyWithoutNamespace = content.replace('notifications.', '');
        const translatedWithNs = safeT(keyWithoutNamespace, content, { ns: 'notifications' });
        if (translatedWithNs !== keyWithoutNamespace && translatedWithNs !== content) {
          return translatedWithNs;
        }
      }

      // If it starts with other namespaces, try those too
      const namespaceMap = {
        'roles.': 'roles',
        'common.': 'common',
        'userRoleManager.': 'userRoleManager',
        'userReview.': 'userReview',
      };

      for (const [prefix, namespace] of Object.entries(namespaceMap)) {
        if (content.startsWith(prefix)) {
          const keyWithoutNamespace = content.replace(prefix, '');
          const translatedWithNs = safeT(keyWithoutNamespace, content, { ns: namespace });
          if (translatedWithNs !== keyWithoutNamespace && translatedWithNs !== content) {
            return translatedWithNs;
          }
        }
      }
    }

    // If it's not a translation key or translation failed, return as-is
    return content || fallback;
  };

  // Get translated notification title
  const getNotificationTitle = () => {
    return translateContent(notification.title, safeT('untitled', 'Untitled'));
  };

  // Get translated notification description with variable substitution
  const getNotificationDescription = () => {
    let description = translateContent(notification.description || notification.message, '');

    // Handle variable substitution for common patterns
    if (description && typeof description === 'string') {
      // Create interpolation data from notification metadata or notification object itself
      const interpolationData = {
        role: notification.metadata?.role || notification.role || notification.targetRole,
        user: notification.metadata?.user || notification.user || notification.displayName,
        name: notification.metadata?.name || notification.name || notification.displayName,
        email: notification.metadata?.email || notification.email,
        count: notification.metadata?.count || notification.count,
        // Add more common interpolation variables as needed
      };

      // Use i18next interpolation if the description is a translation key
      if (description.includes('{{') && description.includes('}}')) {
        try {
          // Try translating with interpolation using i18next
          const translationKey = notification.description || notification.message;
          if (translationKey && translationKey.includes('.')) {
            // If it's a notifications key, try with notifications namespace
            if (translationKey.startsWith('notifications.')) {
              const keyWithoutNamespace = translationKey.replace('notifications.', '');
              const interpolated = t(keyWithoutNamespace, {
                ...interpolationData,
                ns: 'notifications',
                defaultValue: description,
              });
              if (interpolated !== keyWithoutNamespace) {
                description = interpolated;
              }
            } else {
              // Try with other namespaces
              const interpolated = t(translationKey, {
                ...interpolationData,
                defaultValue: description,
              });
              if (interpolated !== translationKey) {
                description = interpolated;
              }
            }
          }
        } catch (error) {
          console.warn('Error interpolating notification description:', error);
        }

        // If i18next interpolation didn't work, fall back to manual replacement
        if (description.includes('{{') && description.includes('}}')) {
          Object.entries(interpolationData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              description = description.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }
          });
        }
      }
    }

    return description;
  };

  // Get notification type icon and color
  const getTypeIcon = (type) => {
    const iconColor = isDarkMode
      ? {
          success: '#7BAE7F',
          warning: '#D9B382',
          error: '#B85C38',
          info: '#6C8E7B',
        }
      : {
          success: '#52c41a',
          warning: '#faad14',
          error: '#f5222d',
          info: '#1890ff',
        };

    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: iconColor.success }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: iconColor.warning }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: iconColor.error }} />;
      case 'info':
      default:
        return <InfoCircleOutlined style={{ color: iconColor.info }} />;
    }
  };

  // Get tag color based on notification type
  const getTagColor = (type) => {
    if (isDarkMode) {
      switch (type) {
        case 'success':
          return 'green';
        case 'warning':
          return 'gold';
        case 'error':
          return 'red';
        case 'info':
        default:
          return 'blue';
      }
    }

    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'processing';
    }
  };

  // Get priority icon and color
  const getPriorityIcon = (priority) => {
    const iconColor = isDarkMode
      ? {
          urgent: '#B85C38',
          high: '#D9B382',
          low: '#6C8E7B',
        }
      : {
          urgent: '#ff4d4f',
          high: '#fa8c16',
          low: '#1890ff',
        };

    switch (priority) {
      case 'urgent':
        return <FireOutlined style={{ color: iconColor.urgent }} />;
      case 'high':
        return <ExclamationCircleFilled style={{ color: iconColor.high }} />;
      case 'low':
        return <ClockCircleOutlined style={{ color: iconColor.low }} />;
      case 'normal':
      default:
        return null;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    if (isDarkMode) {
      switch (priority) {
        case 'urgent':
          return 'red';
        case 'high':
          return 'gold';
        case 'low':
          return 'blue';
        case 'normal':
        default:
          return 'default';
      }
    }

    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'low':
        return 'blue';
      case 'normal':
      default:
        return 'default';
    }
  };

  // Get priority styling class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      case 'low':
        return 'priority-low';
      case 'normal':
      default:
        return 'priority-normal';
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Mark as read if unread and handler exists
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  // Handle mark as read/unread toggle
  const handleReadToggle = (e) => {
    e.stopPropagation(); // Prevent triggering notification click

    if (notification.isRead && onMarkAsUnread) {
      onMarkAsUnread(notification.id);
    } else if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  // Handle click with ripple effect
  const handleItemClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = 100;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');

    e.currentTarget.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    handleNotificationClick();
  };

  const priorityIcon = getPriorityIcon(notification.priority);

  // Adjust styles based on compact mode and dark mode
  const titleFontSize = compact
    ? !notification.isRead
      ? '15px'
      : '14px'
    : !notification.isRead
      ? '16px'
      : '15px';

  const descriptionFontSize = compact ? '13px' : '14px';
  const timeFontSize = compact ? '12px' : '13px';
  const tagFontSize = compact ? '11px' : '12px';

  // Dark mode color scheme
  const colors = {
    background: isDarkMode ? '#2e2c26' : '#ffffff',
    text: {
      primary: isDarkMode ? '#e9e5dd' : '#262626',
      secondary: isDarkMode ? '#b9b5ad' : '#8c8c8c',
      unread: isDarkMode ? '#e9e5dd' : '#262626',
      read: isDarkMode ? '#b9b5ad' : '#595959',
    },
    border: {
      unread: isDarkMode ? '#9bc4a0' : '#1890ff',
      normal: isDarkMode ? '#434239' : '#f0f0f0',
    },
    button: {
      color: isDarkMode ? '#9bc4a0' : '#1890ff',
      hoverBg: isDarkMode ? '#39382d' : '#f5f5f5',
    },
    avatar: {
      border: isDarkMode ? '#9bc4a0' : '#1890ff',
      bg: isDarkMode ? '#39382d' : '#f0f2f5',
    },
  };

  return (
    <List.Item
      onClick={handleItemClick}
      role="button"
      tabIndex={0}
      aria-label={safeT('accessibility.notificationItem', 'Notification', {
        title: notification.title,
      })}
      aria-describedby={`notification-${notification.id}-content`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNotificationClick();
        }
      }}
      style={{
        cursor: 'pointer',
        backgroundColor: colors.background,
        borderLeft: !notification.isRead
          ? `4px solid ${colors.border.unread}`
          : '4px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: compact ? '12px 16px' : '16px 20px',
        minHeight: compact ? '70px' : '80px',
        color: colors.text.primary,
        position: 'relative',
        overflow: 'hidden',
      }}
      className={`notification-item ${!notification.isRead ? 'unread' : 'read'} ${getPriorityClass(
        notification.priority,
      )} ${compact ? 'compact' : ''} ${isDarkMode ? 'dark-mode hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
      extra={
        <Space
          size={compact ? 'small' : 'middle'}
          style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
        >
          {/* Priority indicator for urgent/high priority */}
          {(notification.priority === 'urgent' || notification.priority === 'high') && (
            <Tooltip title={safeT(`priority.${notification.priority}`, notification.priority)}>
              <Badge
                dot
                color={getPriorityColor(notification.priority)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  animation: 'pulse-badge 1.5s infinite',
                }}
              >
                {priorityIcon}
              </Badge>
            </Tooltip>
          )}

          {/* Link indicator */}
          {notification.link && (
            <Tooltip title={safeT('hasLink', 'Has Link')}>
              <LinkOutlined
                style={{
                  color: colors.button.color,
                  fontSize: compact ? '12px' : '14px',
                  transition: 'all 0.3s ease',
                }}
                className="link-icon"
              />
            </Tooltip>
          )}

          {/* Mark as read/unread button */}
          <Tooltip
            title={
              notification.isRead
                ? safeT('markAsUnread', 'Mark as Unread')
                : safeT('markAsRead', 'Mark as Read')
            }
          >
            <Button
              type="text"
              size={compact ? 'small' : 'middle'}
              icon={notification.isRead ? <EyeOutlined /> : <CheckOutlined />}
              onClick={handleReadToggle}
              className={`mark-read-button ${notification.isRead ? 'mark-unread' : 'mark-read'} ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-all duration-300`}
              aria-label={
                notification.isRead
                  ? safeT('accessibility.markAsUnread', 'Mark as unread')
                  : safeT('accessibility.markAsReadButton', 'Mark as read')
              }
              data-testid={`mark-read-btn-${notification.id}`}
              style={{
                color: notification.isRead ? colors.text.secondary : colors.button.color,
                borderColor: notification.isRead ? colors.text.secondary : colors.button.color,
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            />
          </Tooltip>

          {/* Time indicator */}
          <div
            className="time-indicator"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ClockCircleOutlined
              style={{
                fontSize: compact ? '10px' : '12px',
                color: colors.text.secondary,
                transition: 'color 0.3s ease',
              }}
            />
            <Text
              type="secondary"
              className="notification-time"
              style={{
                fontSize: timeFontSize,
                color: colors.text.secondary,
                transition: 'color 0.3s ease',
              }}
            >
              {formatRelativeTime(notification.createdAt)}
            </Text>
          </div>
        </Space>
      }
    >
      <List.Item.Meta
        avatar={
          <Badge dot={!notification.isRead} color="#f5222d" style={{ marginTop: '4px' }}>
            <Avatar
              size={compact ? 'default' : 'large'}
              icon={getTypeIcon(notification.type)}
              style={{
                backgroundColor: isDarkMode
                  ? colors.avatar.bg
                  : getTagColor(notification.type) === 'processing'
                    ? '#1890ff'
                    : getTagColor(notification.type) === 'success'
                      ? '#52c41a'
                      : getTagColor(notification.type) === 'warning'
                        ? '#faad14'
                        : getTagColor(notification.type) === 'error'
                          ? '#f5222d'
                          : '#1890ff',
                border: !notification.isRead ? `2px solid ${colors.avatar.border}` : 'none',
                transition: 'all 0.3s ease',
              }}
              className="notification-avatar"
            />
          </Badge>
        }
        title={
          <div
            className="notification-header"
            id={`notification-${notification.id}-content`}
            style={{ width: '100%' }}
          >
            <div style={{ marginBottom: '6px' }}>
              <Text
                strong={!notification.isRead}
                className={`notification-title ${!notification.isRead ? 'unread-title' : ''}`}
                style={{
                  fontSize: titleFontSize,
                  fontWeight: !notification.isRead ? 600 : 400,
                  color: !notification.isRead ? colors.text.unread : colors.text.read,
                  lineHeight: '1.4',
                  display: 'block',
                  marginBottom: '4px',
                  wordBreak: 'break-word',
                  transition: 'color 0.3s ease',
                }}
              >
                {getNotificationTitle()}
              </Text>
            </div>

            <Space wrap size="small" style={{ width: '100%' }}>
              <Tag
                color={getTagColor(notification.type)}
                className="notification-type-tag"
                style={{
                  fontSize: tagFontSize,
                  margin: '0 4px 4px 0',
                  backgroundColor: isDarkMode ? colors.avatar.bg : undefined,
                  borderColor: isDarkMode ? colors.border.normal : undefined,
                  color: isDarkMode ? colors.text.primary : undefined,
                  transition: 'all 0.3s ease',
                }}
              >
                {safeT(`types.${notification.type}`, notification.type)}
              </Tag>

              {notification.priority && notification.priority !== 'normal' && (
                <Tag
                  color={getPriorityColor(notification.priority)}
                  className={`priority-tag priority-${notification.priority}`}
                  icon={priorityIcon}
                  style={{
                    fontSize: tagFontSize,
                    margin: '0 4px 4px 0',
                    backgroundColor: isDarkMode ? colors.avatar.bg : undefined,
                    borderColor: isDarkMode ? colors.border.normal : undefined,
                    color: isDarkMode ? colors.text.primary : undefined,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {safeT(`priority.${notification.priority}`, notification.priority)}
                </Tag>
              )}

              {!notification.isRead && (
                <Badge
                  status="error"
                  text={
                    <span
                      style={{
                        color: colors.text.primary,
                        fontWeight: 'bold',
                        animation: 'pulse-badge 1.5s infinite',
                      }}
                    >
                      {safeT('new', 'New')}
                    </span>
                  }
                  style={{ fontSize: tagFontSize, margin: '0 4px 4px 0' }}
                />
              )}
            </Space>
          </div>
        }
        description={
          <div
            className="notification-content"
            style={{ marginTop: compact ? '6px' : '8px', width: '100%' }}
          >
            <Paragraph
              className={`notification-description ${!notification.isRead ? 'unread-description' : ''}`}
              style={{
                margin: 0,
                fontSize: descriptionFontSize,
                lineHeight: '1.4',
                color: !notification.isRead ? colors.text.unread : colors.text.secondary,
                wordBreak: 'break-word',
                transition: 'color 0.3s ease',
              }}
              ellipsis={
                notification.description?.length > (compact ? 80 : 100)
                  ? {
                      rows: compact ? 1 : 2,
                      expandable: !compact,
                      symbol: compact ? '...' : safeT('showMore', 'Show more', { ns: 'common' }),
                    }
                  : false
              }
            >
              {getNotificationDescription()}
            </Paragraph>

            {/* Targeting info - only show in non-compact mode */}
            {!compact &&
              (notification.targetRoles ||
                notification.targetBranch ||
                notification.targetDepartment) && (
                <div style={{ marginTop: '8px' }}>
                  <Space wrap size="small" style={{ width: '100%' }}>
                    {notification.targetRoles && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '11px',
                          color: colors.text.secondary,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {safeT('targetRoles', 'Target roles')}:{' '}
                        {Array.isArray(notification.targetRoles)
                          ? notification.targetRoles.join(', ')
                          : notification.targetRoles}
                      </Text>
                    )}
                    {notification.targetBranch && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '11px',
                          color: colors.text.secondary,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {safeT('branch', 'Branch', { ns: 'common' })}: {notification.targetBranch}
                      </Text>
                    )}
                    {notification.targetDepartment && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '11px',
                          color: colors.text.secondary,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {safeT('department', 'Department', { ns: 'common' })}:{' '}
                        {notification.targetDepartment}
                      </Text>
                    )}
                  </Space>
                </div>
              )}
          </div>
        }
      />
    </List.Item>
  );
};

export default NotificationItem;
