import React, { createContext, useContext } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';

interface WindowSizeContextType {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const WindowSizeContext = createContext<WindowSizeContextType | undefined>(undefined);

export const useWindowSizeContext = () => {
  const context = useContext(WindowSizeContext);
  if (!context) {
    throw new Error('useWindowSizeContext must be used within a WindowSizeProvider');
  }
  return context;
};

export const WindowSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const windowSize = useWindowSize();

  return <WindowSizeContext.Provider value={windowSize}>{children}</WindowSizeContext.Provider>;
};
