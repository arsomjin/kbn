import React from 'react';
import { Popconfirm, Col } from 'antd';
import { Button } from 'antd';
import { isMobile } from 'react-device-detect';
import { Card } from 'antd';

interface FooterProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  alignRight?: boolean;
  okText?: string;
  cancelText?: string;
  cancelPopConfirmText?: string;
  okPopConfirmText?: string;
  okIcon?: React.ReactNode;
  okOnly?: boolean;
  extraButtons?: React.ReactNode;
  disabled?: boolean;
  buttonWidth?: number;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  onConfirm,
  onCancel,
  alignRight,
  okText,
  cancelText,
  cancelPopConfirmText,
  okPopConfirmText,
  okIcon,
  okOnly,
  extraButtons,
  disabled,
  buttonWidth,
  className
}) => {
  const Buttons = (
    <>
      {!okOnly &&
        (cancelPopConfirmText ? (
          <Popconfirm title={cancelPopConfirmText || 'ยืนยัน?'} okText='ตกลง' cancelText='ยกเลิก' onConfirm={onCancel}>
            <Button
              className='m-1'
              {...(!isMobile && { style: { width: buttonWidth || 132 } })}
              size='middle'
              disabled={disabled}
            >
              {cancelText || 'ยกเลิก'}
            </Button>
          </Popconfirm>
        ) : (
          <Button
            className='m-1'
            {...(!isMobile && { style: { width: buttonWidth || 132 } })}
            size='middle'
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelText || 'ยกเลิก'}
          </Button>
        ))}
      {okPopConfirmText ? (
        <Popconfirm title={okPopConfirmText || 'ยืนยัน?'} okText='ตกลง' cancelText='ยกเลิก' onConfirm={onConfirm}>
          <Button
            className='m-1'
            {...(!isMobile && { style: { width: buttonWidth || 132 } })}
            type='primary'
            size='middle'
            icon={okIcon}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {okText || 'บันทึกข้อมูล'}
          </Button>
        </Popconfirm>
      ) : (
        <Button
          className='m-1'
          {...(!isMobile && { style: { width: 140 } })}
          type='primary'
          onClick={onConfirm}
          size='middle'
          icon={okIcon}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {okText || 'บันทึกข้อมูล'}
        </Button>
      )}
    </>
  );

  if (extraButtons) {
    return isMobile ? (
      <Card
        className={`d-flex p-2 border-top ${alignRight ? 'justify-content-end' : ''} ${isMobile ? 'flex-column' : ''}`}
        style={{ border: 'none', borderTop: '1px solid #d9d9d9' }}
      >
        {extraButtons}
        {Buttons}
      </Card>
    ) : (
      <Card className={`d-flex p-2 border-top`} style={{ border: 'none', borderTop: '1px solid #d9d9d9' }}>
        <div className='d-flex flex-row' style={{ flex: 1, justifyContent: 'space-between' }}>
          <Col span={12}>{extraButtons}</Col>
          <Col span={12}>
            <div className='d-flex flex-row justify-content-end'>{Buttons}</div>
          </Col>
        </div>
      </Card>
    );
  }
  return (
    <Card
      className={`d-flex p-2 border-top ${
        alignRight ? 'justify-content-end' : ''
      } ${isMobile ? 'flex-column' : ''} ${className || ''}`}
      style={{ border: 'none', borderTop: '1px solid #d9d9d9' }}
    >
      {Buttons}
    </Card>
  );
};

export default Footer;
