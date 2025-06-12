import { FirebaseContext } from '../../../../firebase';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { logoutUser } from 'redux/actions/auth';
import { Dropdown, Button, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const UserActions = () => {
  const { app } = useContext(FirebaseContext);
  const { isLoggingOut, logoutError, user } = useSelector(state => state.auth);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Update state & Log out.
    let updateStateRef = app.firestore().collection('status').doc(user.uid);
    updateStateRef.get().then(doc => {
      if (doc.exists) {
        updateStateRef.update({ state: 'offline', last_offline: Date.now() }).then(() => {
          dispatch(logoutUser());
          // Force navigation to login route
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        });
      } else {
        dispatch(logoutUser());
        // Force navigation to login route
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }).catch(error => {
      console.warn('Error updating status during logout:', error);
      // Still logout even if status update fails
      dispatch(logoutUser());
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    });
  };

  const _onClick = path => {
    history.push(path);
  };

  const isMe = user.email && user.email === 'arsom@happyinnovation.net';

  const DisplayName = isMe
    ? 'Happy Innovation'
    : user.displayName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email);

  const DisplayAvatar = isMe
    ? require('../../../../images/avatars/happyInnovation.png')
    : user.photoURL || require('../../../../images/avatars/blank-profile.png');

  // Create dropdown menu
  const dropdownMenu = (
    <Menu
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(45, 80, 22, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(45, 80, 22, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        minWidth: '200px'
      }}
    >
      <Menu.Item 
        key="profile" 
        icon={<UserOutlined />}
        onClick={() => _onClick('/user-profile')}
      >
        ข้อมูลส่วนตัว
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="logout"
        icon={<LogoutOutlined style={{ color: '#ff4d4f' }} />}
        onClick={handleLogout}
        style={{ color: '#ff4d4f' }}
      >
        ออกจากระบบ
        {isLoggingOut && <span style={{ marginLeft: 8 }}>กำลังออกจากระบบ...</span>}
        {logoutError && <span style={{ marginLeft: 8 }}>เกิดข้อผิดพลาด</span>}
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={dropdownMenu}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        style={{
          height: '46px',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'transparent',
          boxShadow: 'none'
        }}
        className="text-nowrap"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            className="user-avatar rounded-circle"
            src={DisplayAvatar}
            alt="User Avatar"
            style={{ 
              objectFit: 'cover', 
              height: 32, 
              width: 32,
              borderRadius: '50%'
            }}
          />
          <span className="d-none d-md-inline-block" style={{ color: '#1f2937', fontWeight: 500 }}>
            {DisplayName}
          </span>
        </div>
      </Button>
    </Dropdown>
  );
};

export default UserActions;
