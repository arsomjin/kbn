import { Modal } from 'antd';

export const showAlert = (title, content, type = 'info') => {
  Modal[type]({
    title,
    content,
  });
};

export default {
  showAlert,
};
