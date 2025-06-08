import React from 'react';
import { Button } from 'antd';
import { MenuOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';

const NavbarToggle = props => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(toggleSidebar(!menuVisible));
  };

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
        border: 'none'
      }}
      title={menuVisible ? 'Hide Sidebar' : 'Show Sidebar'}
    />
  );
};

export default NavbarToggle;
