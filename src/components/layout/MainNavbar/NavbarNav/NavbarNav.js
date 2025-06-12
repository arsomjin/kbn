import React from 'react';
import PropTypes from 'prop-types';
import { Space } from 'antd';
import { useResponsive } from 'hooks/useResponsive';

import Notifications from './Notifications';
import UserActions from './UserActions';

// Error boundary component
class NavbarNavErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NavbarNav Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="navbar-nav border-right" style={{ 
          display: 'flex', 
          alignItems: 'center',
          borderRight: '1px solid #e8e8e8',
          marginLeft: 'auto',
          padding: '0 12px'
        }}>
          <span style={{ color: '#999', fontSize: '12px' }}>Navigation Error</span>
        </div>
      );
    }

    return this.props.children;
  }
}

NavbarNavErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

const NavbarNav = () => {
  const { isMobile, isTablet } = useResponsive();
  
  // Mobile positioning: top-left
  // Desktop positioning: top-right
  const getNavbarStyle = () => {
    if (isMobile || isTablet) {
      return {
        display: 'flex', 
        alignItems: 'center',
        marginLeft: 0,
        marginRight: 'auto', // Push to left on mobile
        order: -1, // Move before other navbar elements
      };
    }
    
    // Desktop style
    return {
      display: 'flex', 
      alignItems: 'center',
      borderRight: '1px solid #e8e8e8',
      marginLeft: 'auto' // Keep on right for desktop
    };
  };

  try {
    return (
      <NavbarNavErrorBoundary>
        <div 
          className={`navbar-nav flex-row ${isMobile || isTablet ? 'mobile-nav' : 'desktop-nav'}`} 
          style={getNavbarStyle()}
        >
          <Space size={0}>
            {/* Mobile order: Profile | Bell */}
            {/* Desktop order: Bell | Profile (original) */}
            {isMobile || isTablet ? (
              <>
                <UserActions />
                <Notifications />
              </>
            ) : (
              <>
                <Notifications />
                <UserActions />
              </>
            )}
          </Space>
        </div>
      </NavbarNavErrorBoundary>
    );
  } catch (error) {
    console.error('NavbarNav Render Error:', error);
    return (
      <div className="navbar-nav border-right" style={{ 
        display: 'flex', 
        alignItems: 'center',
        borderRight: '1px solid #e8e8e8',
        marginLeft: 'auto',
        padding: '0 12px'
      }}>
        <span style={{ color: '#999', fontSize: '12px' }}>Nav Error</span>
      </div>
    );
  }
};

export default NavbarNav;
