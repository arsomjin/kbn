import NotificationCenter from './NotificationCenter';
import NotificationDrawer from './NotificationDrawer';
import NotificationList from './NotificationList';
import NotificationItem from './NotificationItem';
import NotificationSettings from './NotificationSettings';
import ComposeNotification from './ComposeNotification';
import ToastNotification from './ToastNotification';

export {
  NotificationCenter,
  NotificationDrawer,
  NotificationList,
  NotificationItem,
  NotificationSettings,
  ComposeNotification,
  ToastNotification,
};

/**
 * NotificationProvider component to be used at the app root level
 * This will set up toast notifications throughout the application
 */
const NotificationProvider = ({ children }) => {
  return <ToastNotification>{children}</ToastNotification>;
};

export default NotificationProvider;
