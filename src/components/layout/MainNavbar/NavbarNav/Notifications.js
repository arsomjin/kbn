import React, { useState } from 'react';
import { NavItem, NavLink, Badge, Collapse, DropdownItem } from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications } from 'redux/actions/data';
import moment from 'moment';
import Parser from 'html-react-parser';
import { getDepartmentIcon, getColorFromStatus } from 'api';
import { useHistory } from 'react-router-dom';

const Notifications = () => {
  const { notifications, departments } = useSelector(state => state.data);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const toggleNotifications = async () => {
    setVisible(vs => !vs);
    if (!visible) {
      let nData = notifications.map(l => ({ ...l, read: true }));
      dispatch(setNotifications(nData));
    }
  };

  const badgeNumber = notifications.filter(l => !l.read).length;

  const renderNotification = (notif, i) => {
    const { department } = notif;
    const pDescription = Parser(`${notif.description}`);
    return (
      <DropdownItem key={i}>
        <div className="notification__icon-wrapper">
          <div className="notification__icon">
            {department ? (
              getDepartmentIcon(department, notif.type)
            ) : (
              <i
                className="material-icons"
                {...(notif.type && {
                  style: { color: getColorFromStatus(notif.type) }
                })}
              >
                campaign
              </i>
            )}
          </div>
        </div>
        <div className="notification__content">
          {department && <span className="notification__category mr-2">{departments[department].department}</span>}
          <span className="text-semibold">{notif.message}</span>
          <div>
            <i className="material-icons mr-1">schedule</i>
            <span
              className="text-light text-muted"
              style={{
                fontSize: 10,
                alignItems: 'center'
              }}
            >
              {moment(Number(notif.time)).fromNow()}
            </span>
          </div>
          {/* <div>{pDescription}</div> */}
          <div dangerouslySetInnerHTML={{ __html: `${notif.description}` }} />
          {notif.link && (
            <a href={notif.link} target="_blank" rel="noopener noreferrer">
              {notif.link}
            </a>
          )}
          {/* <p>
                Your website’s active users count increased by{' '}
                <span className="text-success text-semibold">28%</span> in the
                last week. Great job!
              </p> */}
        </div>
      </DropdownItem>
    );
  };

  return (
    <NavItem className="border-right dropdown notifications">
      <NavLink
        className="nav-link-icon text-center"
        onClick={toggleNotifications}
        // onClick={() =>
        //   isMessagingSupported
        //     ? toggleNotifications()
        //     : showMessageBar(
        //         'เบราเซอร์นี้ ไม่รองรับการแจ้งเตือน',
        //         'Notification is not supported for this browser.',
        //         'warning'
        //       )
        // }
      >
        <div className="nav-link-icon__wrapper">
          <i className="material-icons">&#xE7F4;</i>
          {badgeNumber > 0 && (
            <Badge pill theme="danger">
              {badgeNumber}
            </Badge>
          )}
        </div>
      </NavLink>
      <Collapse open={visible} className="dropdown-menu dropdown-menu-small">
        {notifications.map((notif, i) => renderNotification(notif, i))}
        <DropdownItem onClick={() => history.push('/changelogs')} className="notification__all text-center">
          ดูการแจ้งเตือนทั้งหมด
        </DropdownItem>
      </Collapse>
    </NavItem>
  );
};

export default Notifications;
