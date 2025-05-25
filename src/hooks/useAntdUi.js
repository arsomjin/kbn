import { App, Modal as antdModal, message as antdMessage, notification as antdNotification } from 'antd';

/**
 * useAntdUi - Unified hook for context-aware Ant Design modal, message, and notification APIs
 * Returns { modal, message, notification }
 * Use inside components wrapped with <App> for theme/context support
 */
export const useAntdUi = () => {
  try {
    const appContext = App.useApp?.();
    const modal = appContext?.modal || antdModal;
    const message = appContext?.message || antdMessage;
    const notification = appContext?.notification || antdNotification;
    return { modal, message, notification };
  } catch (error) {
    // Error is expected and can be safely ignored
    // This is a fallback for when App.useApp() is not available
    void error; // Explicitly mark error as unused
    return { modal: antdModal, message: antdMessage, notification: antdNotification };
  }
};

// Export static APIs for use outside React context if needed
export const Modal = antdModal;
export const message = antdMessage;
export const notification = antdNotification;
