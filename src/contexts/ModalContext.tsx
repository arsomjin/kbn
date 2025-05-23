import React, { createContext, useContext, useMemo } from 'react';
import { App, Modal } from 'antd';
import { useAntdUi } from '../hooks/useAntdUi';
import { useTranslation } from 'react-i18next';

// Types for modal/notification functions
export type ModalContextType = {
  showConfirm: (options: {
    title?: string;
    content: React.ReactNode;
    onOk?: () => void;
    onCancel?: () => void;
  }) => void;
  showSuccess: (content: string, duration?: number, onClose?: () => void) => void;
  showSuccessModal: (options: {
    title?: string;
    content: React.ReactNode;
    onOk?: () => void;
    onCancel?: () => void;
  }) => void;
  showWarning: (content: string, duration?: number, onClose?: () => void) => void;
  showActionSheet: (options: {
    title?: string;
    content: React.ReactNode;
    onOk?: () => void;
    onCancel?: () => void;
  }) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const app = App.useApp?.();
  const modal = app?.modal || Modal;
  const { modal: newModal, message } = useAntdUi();
  const { t } = useTranslation();

  const contextValue = useMemo<ModalContextType>(
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
          maskClosable: false
        });
      },
      showSuccess: (content, duration = 5, onClose) => {
        message.success({
          content: content || t('common:success', 'Success'),
          duration,
          icon: <span style={{ color: '#52c41a', fontSize: 20 }}>✔️</span>,
          key: 'global-success',
          onClose
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
          maskClosable: false
        });
      },
      showWarning: (content, duration = 5, onClose) => {
        message.warning({
          content: content || t('common:warning', 'Warning'),
          duration,
          key: 'global-warning',
          onClose
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
          maskClosable: false
        });
      }
    }),
    [modal, message, t]
  );

  return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>;
};

export const useModal = (): ModalContextType => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
};
