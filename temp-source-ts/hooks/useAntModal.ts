import { Modal as antdModal } from 'antd';
import { App } from 'antd';

/**
 * Custom hook to use Ant Design Modal API with proper App context
 *
 * Note: This hook should be used within components wrapped with App component
 */
export const useAntdModal = () => {
  try {
    const appContext = App.useApp?.();
    const modal = appContext?.modal || antdModal;
    return { modal };
  } catch (e) {
    return { modal: antdModal };
  }
};

// Export the static Modal directly for components outside App context
export const Modal = antdModal;
