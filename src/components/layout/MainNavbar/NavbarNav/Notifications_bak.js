import { notification } from 'antd';
import { showToBeContinue } from 'functions';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { NavItem, NavLink, Badge, Collapse, DropdownItem } from 'shards-react';

export default class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };

    this.toggleNotifications = this.toggleNotifications.bind(this);
  }

  openNotification = notif => {
    notification.info({
      message: notif.title,
      description: notif.body,
      top: isMobile ? 38 : 76
    });
  };

  toggleNotifications() {
    this.openNotification({
      title: 'ทดสอบการแจ้งเตือน',
      body: 'Test notification text.'
    });
    // this.setState({
    //   visible: !this.state.visible,
    // });
  }

  render() {
    return (
      <NavItem className="border-right dropdown notifications">
        <NavLink className="nav-link-icon text-center" onClick={this.toggleNotifications}>
          <div className="nav-link-icon__wrapper">
            <i className="material-icons">&#xE7F4;</i>
            <Badge pill theme="danger">
              2
            </Badge>
          </div>
        </NavLink>
        <Collapse open={this.state.visible} className="dropdown-menu dropdown-menu-small">
          <DropdownItem>
            <div className="notification__icon-wrapper">
              <div className="notification__icon">
                <i className="material-icons">&#xE6E1;</i>
              </div>
            </div>
            <div className="notification__content">
              <span className="notification__category">Analytics</span>
              <p>
                ยอดขายรวมเพิ่มขึ้น <span className="text-success text-semibold">28%</span> จากสัปดาห์ที่แล้ว ยอดเยี่ยม!
              </p>
              {/* <p>
                Your website’s active users count increased by{' '}
                <span className="text-success text-semibold">28%</span> in the
                last week. Great job!
              </p> */}
            </div>
          </DropdownItem>
          <DropdownItem>
            <div className="notification__icon-wrapper">
              <div className="notification__icon">
                <i className="material-icons">&#xE8D1;</i>
              </div>
            </div>
            <div className="notification__content">
              <span className="notification__category">Sales</span>
              <p>
                สัปดาห์ที่แล้ว ยอดบริการในศูนย์ลดลง <span className="text-danger text-semibold">5.52%</span>.
                มีบางอย่างต้องปรับปรุง!
              </p>
              {/* <p>
                Last week your store’s sales count decreased by{' '}
                <span className="text-danger text-semibold">5.52%</span>. It
                could have been worse!
              </p> */}
            </div>
          </DropdownItem>
          <DropdownItem onClick={() => showToBeContinue()} className="notification__all text-center">
            View all Notifications
          </DropdownItem>
        </Collapse>
      </NavItem>
    );
  }
}
