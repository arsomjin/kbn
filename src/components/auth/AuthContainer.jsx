import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeSwitch from '../common/ThemeSwitch';
import '../common/ThemeSwitch.css';
import LanguageSwitcher from '../common/LanguageSwitcher';
import officeImage from '../../assets/images/office.jpg';
import logoImage from '../../assets/logo/android-chrome-192x192.png';

const { Title } = Typography;

const AuthContainer = ({
  children,
  title,
  subtitle,
  showThemeSwitch = true,
  showLanguageSwitcher = true,
  animationKey = 'default',
  showAnimatedBackground = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Calculate scroll position for fade effect (mobile only)
  const [fade, setFade] = useState(1);
  useEffect(() => {
    if (!isMobile) {
      setFade(1);
      return;
    }
    const handleScroll = () => {
      // Fade out after 32px, fully invisible after 96px (mobile only)
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      let opacity = 1;
      if (scrollY > 32) {
        opacity = Math.max(0, 1 - (scrollY - 32) / 64);
      }
      setFade(opacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-6 md:py-8 relative w-full"
      style={{
        backgroundColor: 'var(--color-bg)',
        overflow: 'auto',
        paddingTop: isMobile ? 64 : 88, // Add top padding to prevent overlap (logo/toggles height + margin)
      }}
    >
      {/* Blurred background image overlay (fixed) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundColor: 'var(--color-bg)',
          backgroundImage: showAnimatedBackground ? 'none' : `url(${officeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(4px)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* App Logo at top left - fixed for desktop and mobile */}
      <div
        className="z-20 flex items-center justify-center transition-all duration-200"
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          width: isMobile ? 44 : window.innerWidth < 1024 ? 56 : 72,
          height: isMobile ? 44 : window.innerWidth < 1024 ? 56 : 72,
          borderRadius: isMobile ? 14 : 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          background: 'rgba(32, 32, 32, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.18)',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s, opacity 0.2s',
          opacity: isMobile ? fade : 1,
          pointerEvents: isMobile && fade < 0.1 ? 'none' : 'auto',
        }}
        tabIndex={0}
        aria-label="KBN Home"
        onClick={() => (window.location.href = '/')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') window.location.href = '/';
        }}
      >
        <img
          src={logoImage}
          alt="KBN Logo"
          style={{
            height: '70%',
            width: '70%',
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            transition: 'transform 0.2s',
          }}
          className="hover:scale-110 focus:scale-110"
        />
      </div>

      {/* Theme and language switchers - fixed for desktop and mobile */}
      {(showThemeSwitch || showLanguageSwitcher) && (
        <div
          className="z-20 flex items-center gap-2 sm:gap-4 transition-all duration-200"
          style={{
            position: 'fixed',
            top: 8,
            right: 8,
            background: 'rgba(32, 32, 32, 0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: window.innerWidth < 640 ? '4px 8px' : '8px 16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            minHeight: isMobile ? 44 : 56,
            minWidth: isMobile ? 44 : 56,
            alignItems: 'center',
            opacity: isMobile ? fade : 1,
            pointerEvents: isMobile && fade < 0.1 ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}
          aria-label="Theme and Language Switchers"
        >
          {showThemeSwitch && <ThemeSwitch />}
          {showLanguageSwitcher && <LanguageSwitcher />}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.4,
          }}
          className="w-full max-w-[98vw] sm:max-w-[95vw] md:max-w-lg lg:max-w-xl xl:max-w-2xl"
          style={{ minWidth: 0 }}
        >
          <Card className="w-full p-2 sm:p-4 md:p-8">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <Title
                level={isMobile ? 4 : window.innerWidth < 1024 ? 3 : 2}
                className="mb-0 text-accent font-heading"
              >
                {title}
              </Title>
              {subtitle && <p className="mt-2 text-xs sm:text-sm md:text-base">{subtitle}</p>}
            </div>
            {children}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Brand/Logo area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 sm:mt-6 md:mt-8 text-center"
      >
        <Typography.Text className="text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} KBN Platform
        </Typography.Text>
      </motion.div>
    </div>
  );
};

export default AuthContainer;
