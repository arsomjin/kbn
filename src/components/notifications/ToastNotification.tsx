import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notification } from 'antd';
import { CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { removeToast } from '../../store/slices/notificationsSlice';
import { NotificationType } from '../../services/notificationService';
import './ToastNotification.css';

// Map notification types to their corresponding Ant Design notification methods and icons
const notificationTypeMap = {
  [NotificationType.SUCCESS]: {
    method: notification.success,
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
  },
  [NotificationType.INFO]: {
    method: notification.info,
    icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
  },
  [NotificationType.WARNING]: {
    method: notification.warning,
    icon: <WarningOutlined style={{ color: '#faad14' }} />
  },
  [NotificationType.ERROR]: {
    method: notification.error,
    icon: <CloseCircleOutlined style={{ color: '#f5222d' }} />
  }
};

interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  displayed?: boolean; // Added displayed property to fix TS error
}

/**
 * ToastContainer component that manages and displays toast notifications
 */
const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.notifications.toasts || []);

  // Use a ref to keep track of displayed toast IDs
  const displayedIds = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    toasts.forEach(toast => {
      // Skip if already displayed
      if (!toast.id || displayedIds.current.has(toast.id)) return;

      // Mark as displayed
      displayedIds.current.add(toast.id);

      const { method, icon } = notificationTypeMap[toast.type] || notificationTypeMap[NotificationType.INFO];
      const duration = toast.duration || 4.5; // Default duration in seconds

      // Display notification using Ant Design notification component
      method({
        message: toast.title,
        description: toast.message,
        icon,
        duration,
        className: 'kbn-toast-notification',
        onClose: () => {
          if (toast.id) {
            dispatch(removeToast(toast.id));
            displayedIds.current.delete(toast.id);
          }
        }
      });
    });
  }, [toasts, dispatch]);

  // This component doesn't render anything visible
  return null;
};

export default ToastContainer;
