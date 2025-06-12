import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { useResponsive } from 'hooks/useResponsive';

import MainNavbar from '../components/layout/MainNavbar/MainNavbar';
import MainSidebar from '../components/layout/MainSidebar/MainSidebar';
import MainFooter from '../components/layout/MainFooter';

const { Content } = Layout;

const DefaultLayout = ({ children, noNavbar, noFooter }) => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const { isMobile, isTablet } = useResponsive();

  // Different margin logic for desktop vs mobile
  const getLayoutStyle = () => {
    // On mobile/tablet, sidebar slides from right and doesn't affect layout
    if (isMobile || isTablet) {
      return {
        marginLeft: 0,
        minHeight: '100vh'
      };
    }
    
    // On desktop, sidebar affects layout margin
    return {
      marginLeft: menuVisible ? 280 : 0,
      transition: 'margin-left 0.3s ease',
      minHeight: '100vh'
    };
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MainSidebar />
      <Layout style={getLayoutStyle()}>
        {!noNavbar && <MainNavbar />}
        <Content
          id="main-screen"
          className="main-content"
          style={{
            padding: 0,
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)', // Account for navbar height
            overflow: isMobile || isTablet ? 'hidden' : 'auto',
            position: 'relative', // Ensure content doesn't overlap mobile sidebar
            maxWidth: '100vw',
            width: '100%'
          }}
        >
          {children}
        </Content>
        {!noFooter && <MainFooter />}
      </Layout>
    </Layout>
  );
};

DefaultLayout.propTypes = {
  /**
   * The child components to render.
   */
  children: PropTypes.node,
  /**
   * Whether to display the navbar, or not.
   */
  noNavbar: PropTypes.bool,
  /**
   * Whether to display the footer, or not.
   */
  noFooter: PropTypes.bool
};

DefaultLayout.defaultProps = {
  noNavbar: false,
  noFooter: false
};

export default DefaultLayout;
