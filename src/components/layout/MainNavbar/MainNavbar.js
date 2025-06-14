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
  const { isMobile: isResponsiveMobile, isTablet, width } = useResponsive();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isHeaderNav = layout === LAYOUT_TYPES.HEADER_NAVIGATION;
  // Fix mobile detection to match CSS breakpoints (1024px instead of 480px)
  const isMobileDevice = isMobile || width < 1024;

  // Debug logging for mobile detection
  useEffect(() => {
    console.log('📱 Mobile detection:', {
      isMobile,
      isResponsiveMobile,
      isTablet,
      width,
      isMobileDevice,
      shouldUseFixedNavbar: isMobileDevice
    });
  }, [isMobile, isResponsiveMobile, isTablet, width, isMobileDevice]);

  // Manage body padding for fixed navbar
  useEffect(() => {
    if (isMobileDevice) {
      // Add body class for mobile fixed navbar
      document.body.classList.add('has-mobile-fixed-navbar');
      console.log('✅ Added mobile fixed navbar class to body');
    } else {
      // Remove body class for desktop
      document.body.classList.remove('has-mobile-fixed-navbar');
      console.log('✅ Removed mobile fixed navbar class from body');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('has-mobile-fixed-navbar');
    };
  }, [isMobileDevice]);

  // Handle scroll behavior for mobile
  useEffect(() => {
    if (!isMobileDevice) {
      console.log('⏭️ Skipping scroll listener - not mobile device');
      return;
    }

    console.log('📜 Setting up scroll listener for mobile navbar');

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state for styling
      const isScrolled = currentScrollY > 10;
      setScrolled(isScrolled);
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide navbar
        if (!hidden) {
          console.log('⬇️ Hiding navbar - scrolling down');
          setHidden(true);
        }
      } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        // Scrolling up or near top - show navbar
        if (hidden) {
          console.log('⬆️ Showing navbar - scrolling up');
          setHidden(false);
        }
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
      console.log('🧹 Cleaning up scroll listener');
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY, isMobileDevice, hidden]);

  // Dynamic classes for mobile behavior
  const getNavbarClasses = () => {
    const baseClasses = ['main-navbar', 'bg-white'];
    
    if (isMobileDevice) {
      baseClasses.push('mobile-fixed-navbar');
      if (scrolled) baseClasses.push('scrolled');
      if (hidden) baseClasses.push('hidden');
      
      console.log('🎨 Applied mobile navbar classes:', baseClasses);
    } else if (stickyTop) {
      baseClasses.push('sticky-top');
    }
    
    return classNames(baseClasses);
  };

  // Dynamic styles for mobile
  const getNavbarStyles = () => {
    if (!isMobileDevice) return {};
    
    const styles = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1020, // Consistent with CSS
      width: '100%',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      transform: hidden ? 'translateY(-100%)' : 'translateY(0) translateZ(0)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
      transformStyle: 'preserve-3d',
      boxShadow: scrolled 
        ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
        : 'none',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
      backgroundColor: scrolled 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(255, 255, 255, 1)'
    };
    
    console.log('🎨 Applied mobile navbar styles:', {
      hidden,
      scrolled,
      transform: styles.transform
    });
    
    return styles;
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
