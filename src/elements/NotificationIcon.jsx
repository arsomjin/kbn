import { Badge, Dropdown, Card } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import React, { forwardRef, memo, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { w } from 'api';
import { isMobile } from 'react-device-detect';

const NotificationIcon = memo(
  forwardRef((props, ref) => {
    const { badgeNumber, icon, data, showAllAction, ...mProps } = props;
    const [visible, setVisible] = useState(false);
    const [mData, setData] = useState(data);
    // showLog('noti_props', props);

    useEffect(() => {
      setData(data);
    }, [data]);

    const handleVisibleChange = (flag) => {
      setVisible(flag);
    };

    if (!badgeNumber) {
      return null;
    }

    const notificationItems = mData?.map((item, i) => ({
      key: i,
      label: (
        <div
          onClick={item.onClick}
          className="border-bottom"
          style={{ minWidth: 320, maxWidth: isMobile ? 360 : w(65), padding: '8px' }}
        >
          <div className="d-flex px-1">
            <span>#</span>
            <span className="text-semibold text-fiord-blue ml-1">{item.title}</span>
            <span className="ml-auto text-right text-semibold text-reagent-gray">
              {dayjs(item.time).format('D MMM YYYY HH:mm')}
            </span>
          </div>
          <div className="px-1">
            {typeof item.detail === 'string' ? <p>{item.detail}</p> : item.detail}
          </div>
        </div>
      ),
    }));

    if (showAllAction) {
      notificationItems?.push({
        key: 'show-all',
        label: (
          <div onClick={showAllAction} className="notification__all text-center">
            ดูทั้งหมด
          </div>
        ),
      });
    }

    const dropdownRender = () => (
      <Card style={{ maxWidth: isMobile ? 380 : w(70) }}>
        {notificationItems?.map((item) => (
          <div key={item.key}>{item.label}</div>
        ))}
      </Card>
    );

    return (
      <Dropdown
        open={visible}
        onOpenChange={handleVisibleChange}
        dropdownRender={dropdownRender}
        trigger={['click']}
        placement="bottomRight"
      >
        <div className="nav-link-icon text-center" style={{ cursor: 'pointer' }}>
          <div className="nav-link-icon__wrapper">
            <Badge count={badgeNumber} {...mProps}>
              {icon ? (
                <i className="material-icons">{icon}</i>
              ) : (
                <BellOutlined style={{ fontSize: '18px' }} />
              )}
            </Badge>
          </div>
        </div>
      </Dropdown>
    );
  }),
);

export default NotificationIcon;
