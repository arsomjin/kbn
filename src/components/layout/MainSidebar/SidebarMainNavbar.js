import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';
import { usePermissions } from 'hooks/usePermissions';
import { getProvinceName } from 'utils/mappings';

const { Title, Text } = Typography;

const SidebarMainNavbar = props => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const dispatch = useDispatch();
  
  // Use unified permissions hook for Clean Slate RBAC
  const { 
    homeLocation,
    accessibleProvinces 
  } = usePermissions();
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar(!menuVisible));
  };

  // Get current province name using Clean Slate RBAC
  const getCurrentProvinceName = () => {
    // Priority: Home province → First accessible province → Default
    if (homeLocation?.province) {
      return getProvinceName(homeLocation.province) || 'นครสวรรค์';
    }
    
    if (accessibleProvinces.length > 0) {
      const firstProvince = accessibleProvinces[0];
      return getProvinceName(firstProvince) || 'นครสวรรค์';
    }
    
    return 'นครสวรรค์'; // Default fallback - use Nakhon Sawan for new system
  };

  return (
    <div className="main-navbar" style={{
      padding: '12px 16px',
      borderBottom: '1px solid #f0f0f0',
      background: '#fff',
      minHeight: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        flex: 1,
        cursor: 'pointer'
      }}>
        <img
          id="main-logo"
          style={{ 
            width: '38px', 
            height: '38px',
            marginRight: '12px'
          }}
          src={require('../../../images/logo192.png')}
          alt="KBN"
        />
        
        {!props.hideLogoText && (
          <div style={{ flex: 1 }}>
            <Title 
              level={5} 
              style={{ 
                margin: 0, 
                fontSize: '16px',
                fontWeight: 600,
                color: '#1f2937'
              }}
            >
              KBN
            </Title>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '12px',
                fontWeight: 400,
                display: 'block',
                marginTop: '2px'
              }}
            >
              {getCurrentProvinceName()}
            </Text>
          </div>
        )}
      </div>

      {/* Mobile menu toggle */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={handleToggleSidebar}
        className="toggle-sidebar"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'transparent'
        }}
        size="small"
      />
    </div>
  );
};

SidebarMainNavbar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

SidebarMainNavbar.defaultProps = {
  hideLogoText: false
};

export default SidebarMainNavbar;
