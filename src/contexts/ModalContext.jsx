import React, { createContext, useContext, useMemo } from 'react';
import { App, Modal, notification } from 'antd';
import { useAntdUi } from '../hooks/useAntdUi';
import { useTranslation } from 'react-i18next';

const ModalContext = createContext(undefined);

export const ModalProvider = ({ children }) => {
  const app = App.useApp?.();
  const modal = app?.modal || Modal;
  const { message } = useAntdUi();
  const { t } = useTranslation();

  const contextValue = useMemo(
    () => ({
      showConfirm: ({ title = t('common:confirm', 'ยืนยัน'), content, onOk, onCancel }) => {
        modal.confirm({
          title,
          content,
          onOk,
          onCancel,
          okText: t('common:confirm', 'ตกลง'),
          cancelText: t('common:cancel', 'ยกเลิก'),
          centered: true,
          maskClosable: false,
        });
      },
      showSuccess: (content, duration = 5, onClose) => {
        message.success({
          content: content || t('common:success', 'Success'),
          duration,
          icon: <span style={{ color: '#52c41a', fontSize: 20, marginRight: 10 }}>✔️</span>,
          key: 'global-success',
          onClose,
        });
      },
      showSuccessModal: ({ title = t('common:confirm', 'ยืนยัน'), content, onOk, onCancel }) => {
        modal.success({
          title,
          content,
          onOk,
          onCancel,
          okText: t('common:confirm', 'ตกลง'),
          centered: true,
          maskClosable: false,
        });
      },
      showWarning: (content, duration = 5, onClose) => {
        message.warning({
          content: content || t('common:warning', 'Warning'),
          duration,
          key: 'global-warning',
          onClose,
        });
      },
      showInfo: (content, duration = 5, onClose) => {
        message.info({
          content: content || t('common:info', 'Information'),
          duration,
          icon: <span style={{ color: '#1890ff', fontSize: 20, marginRight: 10 }}>ℹ️</span>,
          key: 'global-info',
          onClose,
        });
      },
      showActionSheet: ({ title = t('common:confirm', 'ยืนยัน'), content, onOk, onCancel }) => {
        modal.confirm({
          title,
          content,
          onOk,
          onCancel,
          okText: t('common:confirm', 'ตกลง'),
          cancelText: t('common:cancel', 'ยกเลิก'),
          centered: true,
          maskClosable: false,
        });
      },
    }),
    [modal, message, t],
  );

  return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
};
