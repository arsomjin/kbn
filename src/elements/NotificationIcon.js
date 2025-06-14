/**
 * Modern NotificationIcon Component
 * Replacement for the old Shards React notification component
 * Now using Ant Design for consistency
 */

import React, { useState, memo, forwardRef } from 'react';
import { Badge, Dropdown, Menu, Button, Typography, Space, Empty } from 'antd';
import {
  BellOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const NotificationIcon = memo(
  forwardRef((props, ref) => {
    const {
      badgeNumber = 0,
      theme = 'danger',
      icon = 'notifications',
      data = [],
      showAllAction,
      ...mProps
    } = props;

    const [visible, setVisible] = useState(false);

    // Don't render if no badge number
    if (!badgeNumber) {
      return null;
    }

    // Map old icon names to Ant Design icons
    const getIcon = (iconName) => {
      const iconMap = {
        notifications: <BellOutlined />,
        edit: <EditOutlined />,
        info: <InfoCircleOutlined />,
        '&#xE7F4;': <BellOutlined />, // Material icon fallback
      };
      return iconMap[iconName] || <BellOutlined />;
    };

    // Map old themes to Ant Design colors
    const getColor = (themeName) => {
      const colorMap = {
        danger: '#ff4d4f',
        warning: '#faad14',
        success: '#52c41a',
        info: '#1890ff',
        primary: '#1890ff',
      };
      return colorMap[themeName] || '#ff4d4f';
    };

    // Create menu items from data
    const menuItems =
      data && data.length > 0
        ? data.map((item, index) => ({
            key: index,
            label: (
              <div style={{ padding: '8px 0', maxWidth: '250px' }}>
                <Text strong style={{ fontSize: '13px' }}>
                  {item.title || item.message || 'การแจ้งเตือน'}
                </Text>
                {item.description && (
                  <div>
                    <Text type='secondary' style={{ fontSize: '12px' }}>
                      {item.description}
                    </Text>
                  </div>
                )}
                {item.time && (
                  <div>
                    <Text type='secondary' style={{ fontSize: '11px' }}>
                      {item.time}
                    </Text>
                  </div>
                )}
              </div>
            ),
            onClick: item.onClick || (() => {}),
          }))
        : [];

    // Add "View All" option if showAllAction is provided
    if (showAllAction && menuItems.length > 0) {
      menuItems.push({
        type: 'divider',
      });
      menuItems.push({
        key: 'view-all',
        label: (
          <Text
            style={{ textAlign: 'center', display: 'block', color: '#1890ff' }}
          >
            ดูทั้งหมด
          </Text>
        ),
        onClick: showAllAction,
      });
    }

    const menu = (
      <Menu
        items={
          menuItems.length > 0
            ? menuItems
            : [
                {
                  key: 'empty',
                  label: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description='ไม่มีการแจ้งเตือน'
                      style={{ margin: '16px 0' }}
                    />
                  ),
                  disabled: true,
                },
              ]
        }
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          borderRadius: '8px',
        }}
      />
    );

    return (
      <div className='dropdown notifications' ref={ref} {...mProps}>
        <Dropdown
          overlay={menu}
          trigger={['click']}
          visible={visible}
          onVisibleChange={setVisible}
          placement='bottomRight'
          overlayStyle={{
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div
            className='nav-link-icon text-center'
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className='nav-link-icon__wrapper'>
              <Badge
                count={badgeNumber}
                size='small'
                style={{
                  backgroundColor: getColor(theme),
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    color: badgeNumber > 0 ? getColor(theme) : '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getIcon(icon)}
                </div>
              </Badge>
            </div>
          </div>
        </Dropdown>
      </div>
    );
  })
);

NotificationIcon.displayName = 'NotificationIcon';

export default NotificationIcon;
