import { Badge, Collapse } from 'shards-react';
import React, { forwardRef, memo, useEffect, useState } from 'react';
import moment from 'moment';
import { w } from 'api';
import { isMobile } from 'react-device-detect';

export default memo(
  forwardRef((props, ref) => {
    const { badgeNumber, theme, icon, data, showAllAction, ...mProps } = props;
    const [visible, setVisible] = useState(false);
    const [mData, setData] = useState(data);
    // showLog('noti_props', props);

    useEffect(() => {
      setData(data);
    }, [data]);

    const _onClick = () => {
      setVisible(pVisible => !pVisible);
    };

    if (!badgeNumber) {
      return null;
    }

    return (
      <div className="dropdown notifications">
        <div className="nav-link-icon text-center" onClick={_onClick}>
          <div className="nav-link-icon__wrapper">
            {icon ? <i className="material-icons">{icon}</i> : <i className="material-icons">&#xE7F4;</i>}
            <Badge pill theme={theme || 'danger'} {...mProps}>
              {badgeNumber}
            </Badge>
          </div>
        </div>
        {mData && (
          <Collapse
            open={visible}
            className="dropdown-menu dropdown-menu-small mt-2"
            style={{ maxWidth: isMobile ? 380 : w(70) }}
          >
            {mData.map((item, i) => (
              // data = [{ time, title, detail, onClick }]
              <div
                key={i}
                onClick={item.onClick}
                className="border-bottom dropdown-item"
                style={{ minWidth: 320, maxWidth: isMobile ? 360 : w(65) }}
              >
                <div className="d-flex px-1">
                  <span>#</span>
                  <span className="text-semibold text-fiord-blue ml-1">{item.title}</span>
                  <span className="ml-auto text-right text-semibold text-reagent-gray">
                    {moment(item.time).format('D MMM YYYY HH:mm')}
                  </span>
                </div>
                <div className="px-1">{typeof item.detail === 'string' ? <p>{item.detail}</p> : item.detail}</div>
              </div>
            ))}
            {showAllAction && (
              <div onClick={showAllAction} className="notification__all text-center dropdown-item">
                ดูทั้งหมด
              </div>
            )}
          </Collapse>
        )}
      </div>
    );
  })
);
