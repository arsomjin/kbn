import React from 'react';
import { Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MODAL_HEIGHT, MODAL_STYLE, MODAL_WIDTH } from './api';
import { ModalComponentProps } from './types';

const ModalComponent: React.FC<ModalComponentProps> = ({
  children,
  visible,
  onOk,
  onCancel,
  noFooter,
  footer,
  isFull,
  bodyStyle,
  ...props
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal
      open={visible}
      {...(isFull && {
        width: MODAL_WIDTH,
        style: MODAL_STYLE
      })}
      onOk={onOk}
      onCancel={onCancel}
      footer={
        noFooter
          ? null
          : footer || [
              <Button key='cancel' onClick={onCancel}>
                {t('cancel')}
              </Button>,
              <Button key='submit' type='primary' onClick={onOk}>
                {t('confirm')}
              </Button>
            ]
      }
      {...(noFooter && { footer: [] })}
      bodyStyle={{
        ...bodyStyle,
        ...(isFull && {
          overflow: 'scroll',
          maxHeight: MODAL_HEIGHT,
          height: MODAL_HEIGHT
        })
      }}
      maskStyle={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
      {...props}
    >
      {children}
    </Modal>
  );
};

export default ModalComponent;
