import React, { useState } from 'react';
import { Badge as ShardsReactBadge } from 'shards-react';
import { Dropdown, Menu, Badge, Button, Space, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications } from 'redux/actions/data';
import moment from 'moment';
import Parser from 'html-react-parser';
import { getDepartmentIcon, getColorFromStatus } from 'api';
import { useHistory } from 'react-router-dom';

const { Text } = Typography;

const Notifications = () => {
  const { notifications, departments } = useSelector(state => state.data);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const toggleNotifications = async (isOpen) => {
    setVisible(isOpen);
    if (isOpen && !visible) {
      let nData = notifications.map(l => ({ ...l, read: true }));
      dispatch(setNotifications(nData));
    }
  };

  const badgeNumber = notifications.filter(l => !l.read).length;

  const renderNotificationItem = (notif, i) => {
    const { department } = notif;
    return (
      <Menu.Item key={`notification-${i}`} style={{ height: 'auto', padding: 0 }}>
        <div style={{ 
          display: 'flex', 
          padding: '12px 16px',
          borderBottom: i < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
          minWidth: '320px',
          maxWidth: '400px'
        }}>
          <div style={{ 
            marginRight: '12px',
            flexShrink: 0
          }}>
            <div style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1px white, inset 0 0 3px rgba(0, 0, 0, 0.2)'
            }}>
              {department ? (
                getDepartmentIcon(department, notif.type)
              ) : (
                <i
                  className="material-icons"
                  style={{
                    fontSize: '16px',
                    color: getColorFromStatus(notif.type) || '#666',
                    lineHeight: '35px'
                  }}
                >
                  campaign
                </i>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {department && (
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 500,
                  marginBottom: '4px',
                  display: 'block'
                }}
              >
                {departments[department]?.department || department}
              </Text>
            )}
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              {notif.message}
            </Text>
            <div style={{ marginBottom: '8px' }}>
              <Space size="small" style={{ fontSize: '12px', color: '#999' }}>
                <i className="material-icons" style={{ fontSize: '14px' }}>schedule</i>
                <span>{moment(Number(notif.time)).fromNow()}</span>
              </Space>
            </div>
            {notif.description && (
              <div 
                style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
                dangerouslySetInnerHTML={{ __html: notif.description }} 
              />
            )}
            {notif.link && (
              <a 
                href={notif.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '12px',
                  color: '#1890ff',
                  marginTop: '4px',
                  display: 'block',
                  textDecoration: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                ดูรายละเอียด →
              </a>
            )}
          </div>
        </div>
      </Menu.Item>
    );
  };

  // Create dropdown menu
  const dropdownMenu = (
    <Menu
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(45, 80, 22, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(45, 80, 22, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        maxHeight: '500px',
        overflowY: 'auto',
        padding: 0
      }}
    >
      {notifications.length === 0 ? (
        <Menu.Item key="no-notifications" disabled style={{ height: 'auto', padding: 0 }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#999',
            fontSize: '13px'
          }}>
            <i className="material-icons" style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}>
              notifications_none
            </i>
            ไม่มีการแจ้งเตือนใหม่
          </div>
        </Menu.Item>
      ) : (
        notifications.map((notif, i) => renderNotificationItem(notif, i))
      )}
      
      <Menu.Divider />
      
      <Menu.Item 
        key="view-all"
        onClick={() => history.push('/changelogs')}
        style={{ height: 'auto', padding: 0 }}
      >
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '8px 16px',
            fontWeight: 500,
            color: '#1890ff',
            fontSize: '13px'
          }}
        >
          ดูการแจ้งเตือนทั้งหมด
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={dropdownMenu}
      placement="bottomRight"
      trigger={['click']}
      visible={visible}
      onVisibleChange={toggleNotifications}
      className="notifications-dropdown"
    >
      <Button
        type="text"
        className="nav-link-icon text-center border-right"
        style={{
          height: '46px',
          padding: '0 16px',
          border: 'none',
          borderRight: '1px solid #e8e8e8',
          background: 'transparent',
          boxShadow: 'none',
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <i 
            className="material-icons" 
            style={{ 
              fontSize: '1.4rem', 
              color: '#4b5563',
              lineHeight: 1
            }}
          >
            &#xE7F4;
          </i>
          {badgeNumber > 0 && (
            <Badge 
              count={badgeNumber} 
              size="small"
              style={{ 
                position: 'absolute',
                top: '-8px',
                right: '-8px'
              }}
            />
          )}
        </div>
      </Button>
    </Dropdown>
  );
};

export default Notifications;
