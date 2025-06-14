import React from 'react';
import { Modal, Button } from 'antd';
import { MODAL_HEIGHT, MODAL_STYLE, MODAL_WIDTH } from './api';

export default ({ children, visible, onOk, onCancel, noFooter, footer, isFull, bodyStyle, ...props }) => {
  return (
    <Modal
      visible={visible}
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
              <Button key="cancel" onClick={onCancel}>
                ยกเลิก
              </Button>,
              <Button key="submit" type="primary" onClick={onOk}>
                ตกลง
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
