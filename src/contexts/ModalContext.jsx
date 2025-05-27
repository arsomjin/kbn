import React, { createContext, useContext, useMemo } from 'react';
import { App, Modal } from 'antd';
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
      showWarn: (content, duration = 5, onClose) => {
        message.warning({
          content: content || t('common:warning', 'Warning'),
          duration,
          key: 'global-warning',
          onClose,
        });
      },
      showError: (content, duration = 5, onClose) => {
        message.error({
          content: content || t('common:error', 'Error'),
          duration,
          icon: <span style={{ color: '#ff4d4f', fontSize: 20, marginRight: 10 }}>❌</span>,
          key: 'global-error',
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
      showAlert: ({ title = t('common:alert', 'แจ้งเตือน'), content, onOk, type = 'info' }) => {
        const modalMethod =
          type === 'warning'
            ? modal.warning
            : type === 'error'
              ? modal.error
              : type === 'success'
                ? modal.success
                : modal.info;
        modalMethod({
          title,
          content,
          onOk,
          okText: t('common:confirm', 'ตกลง'),
          centered: true,
          maskClosable: false,
        });
      },
      showMessageBar: (content, duration = 5, onClose) => {
        message.info({
          content: content || t('common:info', 'Information'),
          duration,
          key: 'global-message',
          onClose,
        });
      },
      showConfirmDelete: ({
        title = t('common:confirmDelete', 'ยืนยันการลบ'),
        content,
        onOk,
        onCancel,
        itemName,
        unRecoverable = false,
      }) => {
        const deleteContent = unRecoverable
          ? `${content || `ต้องการลบ ${itemName || 'รายการนี้'} หรือไม่?`}\n\n⚠️ การดำเนินการนี้ไม่สามารถยกเลิกได้`
          : content || `ต้องการลบ ${itemName || 'รายการนี้'} หรือไม่?`;

        modal.confirm({
          title,
          content: deleteContent,
          onOk,
          onCancel,
          okText: t('common:delete', 'ลบ'),
          cancelText: t('common:cancel', 'ยกเลิก'),
          okButtonProps: { danger: true },
          centered: true,
          maskClosable: false,
        });
      },
      showGrantDenied: () => {
        message.warning({
          content: t('common:accessDenied', 'คุณไม่มีสิทธิ์ในการดำเนินการนี้'),
          duration: 3,
          key: 'grant-denied',
        });
      },
      showToBeContinue: () => {
        message.info({
          content: t('common:toBeContinue', 'ฟีเจอร์นี้จะเปิดให้ใช้งานในอนาคต'),
          duration: 3,
          key: 'to-be-continue',
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
