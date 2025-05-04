import React, { ReactNode, useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitch from '../common/ThemeSwitch';
import LanguageSwitcher from '../common/LanguageSwitcher';
import AnimatedGradientBackground from '../common/AnimatedGradientBackground';

const { Title } = Typography;

interface AuthContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showThemeSwitch?: boolean;
  showLanguageSwitcher?: boolean;
  animationKey?: string; // Used to trigger animations when route changes
  showAnimatedBackground?: boolean; // New prop to control background
  backgroundIntensity?: 'low' | 'medium' | 'high'; // Control background intensity
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  title,
  subtitle,
  showThemeSwitch = true,
  showLanguageSwitcher = true,
  animationKey = 'default',
  showAnimatedBackground = false,
  backgroundIntensity = 'medium'
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

  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:p-4'
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Animated background */}
      {showAnimatedBackground && <AnimatedGradientBackground intensity={backgroundIntensity} />}

      {/* Theme and language switchers */}
      {(showThemeSwitch || showLanguageSwitcher) && (
        <div className={`${isMobile ? 'relative mb-6 flex justify-center' : 'absolute top-4 right-4'} flex space-x-4`}>
          {showThemeSwitch && <ThemeSwitch />}
          {showLanguageSwitcher && <LanguageSwitcher />}
        </div>
      )}

      <AnimatePresence mode='wait'>
        <motion.div
          key={animationKey} // Use animationKey to trigger animations when route changes
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.4
          }}
          className='w-full max-w-[95%] sm:max-w-md'
        >
          <Card className='w-full p-4 sm:p-8'>
            <div className='text-center mb-6 sm:mb-8'>
              <Title level={isMobile ? 3 : 2} className='mb-0 text-primary font-heading'>
                {title}
              </Title>
              {subtitle && <p className='text-gray-500 mt-2 text-sm sm:text-base'>{subtitle}</p>}
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
        className='mt-6 sm:mt-8 text-center'
      >
        <Typography.Text className='text-gray-500 text-xs sm:text-sm'>
          © {new Date().getFullYear()} KBN Admin Panel
        </Typography.Text>
      </motion.div>
    </div>
  );
};

export default AuthContainer;
