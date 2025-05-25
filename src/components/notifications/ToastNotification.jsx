import React, { createContext, useContext } from 'react';
import { notification } from 'antd';
import './ToastNotification.css';

// Create context for notification methods
const NotificationContext = createContext(null);

// Custom hook to use notification methods
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const ToastNotification = ({ children }) => {
  const showNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
      duration: 4.5,
      className: 'toast-notification',
    });
  };

  const showSuccess = (message, description) => {
    showNotification('success', message, description);
  };

  const showError = (message, description) => {
    showNotification('error', message, description);
  };

  const showInfo = (message, description) => {
    showNotification('info', message, description);
  };

  const showWarning = (message, description) => {
    showNotification('warning', message, description);
  };

  const notificationMethods = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
    </NotificationContext.Provider>
  );
};

export default ToastNotification;
