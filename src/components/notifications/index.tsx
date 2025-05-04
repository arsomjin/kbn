import NotificationCenter from './NotificationCenter';
import ToastNotification from './ToastNotification';
import ComposeNotification from './ComposeNotification';

export { NotificationCenter, ToastNotification, ComposeNotification };

/**
 * NotificationProvider component to be used at the app root level
 * This will set up toast notifications throughout the application
 */
const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastNotification />
    </>
  );
};

export default NotificationProvider;
