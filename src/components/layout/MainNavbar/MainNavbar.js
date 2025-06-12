import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Container, Navbar, NavbarBrand } from 'shards-react';
import { useResponsive } from 'hooks/useResponsive';

import NavbarSearch from './NavbarSearch';
import NavbarNav from './NavbarNav/NavbarNav';
import NavbarToggle from './NavbarToggle';

import { LAYOUT_TYPES } from '../../../utils/constants';
import { isMobile } from 'react-device-detect';

// Import enhanced navigation styles
import 'styles/enhanced-navigation.css';

const MainNavbar = ({ layout, stickyTop }) => {
  const { isMobile: isResponsiveMobile, isTablet } = useResponsive();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isHeaderNav = layout === LAYOUT_TYPES.HEADER_NAVIGATION;
  const isMobileDevice = isMobile || isResponsiveMobile || isTablet;

  // Handle scroll behavior for mobile
  useEffect(() => {
    if (!isMobileDevice) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for styling
      setScrolled(currentScrollY > 10);
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide navbar
        setHidden(true);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        // Scrolling up or near top - show navbar
        setHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for performance
    let timeoutId;
    const throttledHandleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY, isMobileDevice]);

  // Dynamic classes for mobile behavior
  const getNavbarClasses = () => {
    const baseClasses = ['main-navbar', 'bg-white'];
    
    if (isMobileDevice) {
      baseClasses.push('mobile-fixed-navbar');
      if (scrolled) baseClasses.push('scrolled');
      if (hidden) baseClasses.push('hidden');
    } else if (stickyTop) {
      baseClasses.push('sticky-top');
    }
    
    return classNames(baseClasses);
  };

  // Dynamic styles for mobile
  const getNavbarStyles = () => {
    if (!isMobileDevice) return {};
    
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1030,
      transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      boxShadow: scrolled 
        ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
        : 'none',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      backgroundColor: scrolled 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(255, 255, 255, 1)'
    };
  };

  return (
    <div className={getNavbarClasses()} style={getNavbarStyles()}>
      <Container fluid={!isHeaderNav || null} className="p-0">
        <Navbar type="light" className="align-items-stretch flex-md-nowrap p-0">
          {isHeaderNav && (
            <NavbarBrand href="#" style={{ lineHeight: '25px' }}>
              <div className="d-table m-auto">
                <img
                  id="main-logo"
                  className="d-inline-block align-top mr-1 ml-3"
                  style={{ maxWidth: '25px' }}
                  src={require('../../../images/shards-dashboards-logo.svg')}
                  alt="Shards Dashboard"
                />
                <span className="d-none d-md-inline ml-1">Shards Dashboard</span>
              </div>
            </NavbarBrand>
          )}
          {!isMobile && <NavbarSearch />}
          <NavbarNav />
          <NavbarToggle />
        </Navbar>
      </Container>
    </div>
  );
};

MainNavbar.propTypes = {
  /**
   * The layout type where the MainNavbar is used.
   */
  layout: PropTypes.string,
  /**
   * Whether the main navbar is sticky to the top, or not.
   */
  stickyTop: PropTypes.bool
};

MainNavbar.defaultProps = {
  stickyTop: true
};

export default MainNavbar;
