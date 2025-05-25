import React from 'react';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';
import './ToastNotification.css';

const ToastNotification = () => {
  const { t } = useTranslation();

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

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export default ToastNotification;
