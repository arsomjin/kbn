import React, { createContext, useContext } from 'react';
import { useResponsive } from '../hooks/useResponsive';

const WindowSizeContext = createContext(undefined);

export const useResponsiveContext = () => {
  const context = useContext(WindowSizeContext);
  if (!context) {
    throw new Error('useResponsiveContext must be used within a WindowSizeProvider');
  }
  return context;
};

export const WindowSizeProvider = ({ children }) => {
  const windowSize = useResponsive();

  return <WindowSizeContext.Provider value={windowSize}>{children}</WindowSizeContext.Provider>;
}; 