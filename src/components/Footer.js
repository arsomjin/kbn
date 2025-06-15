import { Popconfirm, Col } from 'antd';
import { Button } from 'elements';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { CardFooter } from 'shards-react';

const Footer = ({
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
  className,
}) => {
  const Buttons = (
    <>
      {!okOnly &&
        (cancelPopConfirmText ? (
          <Popconfirm
            title={cancelPopConfirmText || 'ยืนยัน?'}
            okText='ตกลง'
            cancelText='ยกเลิก'
            onConfirm={onCancel}
          >
            <Button
              className='m-1'
              {...(!isMobile && { style: { width: buttonWidth || 132 } })}
              size='medium'
              disabled={disabled}
            >
              {cancelText || 'ยกเลิก'}
            </Button>
          </Popconfirm>
        ) : (
          <Button
            className='m-1'
            {...(!isMobile && { style: { width: buttonWidth || 132 } })}
            size='medium'
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelText || 'ยกเลิก'}
          </Button>
        ))}
      {okPopConfirmText ? (
        <Popconfirm
          title={okPopConfirmText || 'ยืนยัน?'}
          okText='ตกลง'
          cancelText='ยกเลิก'
          onConfirm={onConfirm}
        >
          <Button
            className='m-1'
            {...(!isMobile && { style: { width: buttonWidth || 132 } })}
            type='primary'
            size='medium'
            {...(okIcon && { icon: okIcon })}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
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
          size='medium'
          {...(okIcon && { icon: okIcon })}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {okText || 'บันทึกข้อมูล'}
        </Button>
      )}
    </>
  );

  if (extraButtons) {
    return isMobile ? (
      <CardFooter
        className={`d-flex p-2 border-top ${alignRight ? 'justify-content-end' : ''} ${isMobile ? 'flex-column' : ''}`}
      >
        {extraButtons}
        {Buttons}
      </CardFooter>
    ) : (
      <CardFooter className={`d-flex p-2 border-top`}>
        <div
          className='d-flex flex-row'
          style={{ flex: 1, justifyContent: 'space-between' }}
        >
          <Col span={12}>{extraButtons}</Col>
          <Col span={12}>
            <div className='d-flex flex-row justify-content-end'>{Buttons}</div>
          </Col>
        </div>
      </CardFooter>
    );
  }
  return (
    <CardFooter
      className={`d-flex p-2 border-top ${
        alignRight ? 'justify-content-end' : ''
      } ${isMobile ? 'flex-column' : ''} ${className}`}
    >
      {Buttons}
    </CardFooter>
  );
};

export default Footer;
