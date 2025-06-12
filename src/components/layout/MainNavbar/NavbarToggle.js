import React from 'react';
import { Button } from 'antd';
import { MenuOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';
import { useResponsive } from 'hooks/useResponsive';

const NavbarToggle = props => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const { isMobile, isTablet } = useResponsive();
  const dispatch = useDispatch();
  
  const handleClick = () => {
    dispatch(toggleSidebar(!menuVisible));
  };

  // Hide on desktop, show on tablet and mobile
  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <Button
      type="text"
      icon={menuVisible ? <MenuFoldOutlined /> : <MenuOutlined />}
      onClick={handleClick}
      style={{
        fontSize: '16px',
        width: '46px',
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '8px',
        border: 'none',
        background: 'transparent',
        color: '#4b5563'
      }}
      className="d-lg-none" // Bootstrap class to hide on large screens and up
      title={menuVisible ? 'Hide Sidebar' : 'Show Sidebar'}
    />
  );
};

export default NavbarToggle;
