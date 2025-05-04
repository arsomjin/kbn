import { notification as antdNotification, message as antdMessage } from 'antd';
import { App } from 'antd';

/**
 * Custom hook to use Ant Design message and notification APIs with proper App context
 *
 * Note: This hook should be used within components wrapped with App component
 */
export const useAntdMessage = () => {
  // Try to get App context if available
  try {
    // App.useApp() is the correct way to access the hook
    const appContext = App.useApp?.();

    // Return notification API with proper App context
    const notification = appContext?.notification || antdNotification;
    const message = appContext?.message || antdMessage;

    return {
      notification,
      message
    };
  } catch (e) {
    // Fallback to static methods if App context is not available
    return {
      notification: antdNotification,
      message: antdMessage
    };
  }
};

// Export the static methods directly for components outside App context
export const notification = antdNotification;
export const message = antdMessage;
