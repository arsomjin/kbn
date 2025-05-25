import React, { createContext, useContext } from 'react';
import { useResponsive } from '../hooks/useResponsive';

interface WindowSizeContextType {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const WindowSizeContext = createContext<WindowSizeContextType | undefined>(undefined);

export const useResponsiveContext = () => {
  const context = useContext(WindowSizeContext);
  if (!context) {
    throw new Error('useResponsiveContext must be used within a WindowSizeProvider');
  }
  return context;
};

export const WindowSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const windowSize = useResponsive();

  return <WindowSizeContext.Provider value={windowSize}>{children}</WindowSizeContext.Provider>;
};
