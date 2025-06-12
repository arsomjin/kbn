import React, { forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Layout } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';

import SidebarMainNavbar from './SidebarMainNavbar';
import SidebarSearch from './SidebarSearch';
import EnhancedSidebarNavItems from './EnhancedSidebarNavItems';
import { useResponsive } from 'hooks/useResponsive';
import 'styles/enhanced-navigation.css';

const { Sider } = Layout;

const MainSidebar = forwardRef((props, ref) => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const dispatch = useDispatch();
  const { isMobile } = useResponsive()

  // Set initial sidebar state based on screen size on first mount
  useEffect(() => {
    if (isMobile && menuVisible) {
      dispatch(toggleSidebar(false));
    } else if (!isMobile && !menuVisible) {
      dispatch(toggleSidebar(true));
    }
  }, []); // Only run once on mount

  const classes = classNames('main-sidebar', menuVisible && 'open');

  // Handle breakpoint changes from Ant Design Sider
  const handleBreakpoint = (broken) => {
    // When breakpoint is broken (mobile), hide sidebar
    // When breakpoint is not broken (desktop), show sidebar
    dispatch(toggleSidebar(!broken));
  };

  return (
    <Sider
      ref={ref}
      className={classes}
      width={260}
      collapsedWidth={0}
      collapsed={!menuVisible}
      breakpoint="lg"
      onBreakpoint={handleBreakpoint}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}
      trigger={null}
    >
      <div className="sidebar-content" style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <SidebarMainNavbar hideLogoText={props.hideLogoText} />
        <SidebarSearch />
        
        {/* Enhanced RBAC Navigation - Main Content Area */}
        <div style={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EnhancedSidebarNavItems />
        </div>
      </div>
    </Sider>
  );
});

MainSidebar.displayName = 'MainSidebar';

MainSidebar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

MainSidebar.defaultProps = {
  hideLogoText: false
};

export default MainSidebar;
