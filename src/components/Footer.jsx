import React from 'react';
import { useTranslation } from 'react-i18next';
import { Popconfirm, Col, Row } from 'antd';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';

/**
 * Footer Component
 *
 * A reusable footer component with confirm/cancel buttons and optional popconfirm.
 * Supports extra buttons and responsive design for mobile/desktop layouts.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onConfirm - Callback for confirm button
 * @param {Function} props.onCancel - Callback for cancel button
 * @param {boolean} props.alignRight - Whether to align buttons to the right
 * @param {string} props.okText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.cancelPopConfirmText - Popconfirm text for cancel button
 * @param {string} props.okPopConfirmText - Popconfirm text for confirm button
 * @param {React.ReactNode} props.okIcon - Icon for confirm button
 * @param {boolean} props.okOnly - Whether to show only confirm button
 * @param {React.ReactNode} props.extraButtons - Additional buttons to display
 * @param {boolean} props.disabled - Whether buttons are disabled
 * @param {number} props.buttonWidth - Custom button width
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} Footer component
 */
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
  const { t } = useTranslation();

  const Buttons = (
    <>
      {!okOnly &&
        (cancelPopConfirmText ? (
          <Popconfirm
            title={cancelPopConfirmText || t('components.footer.confirmCancel')}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            onConfirm={onCancel}
          >
            <Button
              className="m-1"
              {...(!isMobile && { style: { width: buttonWidth || 132 } })}
              size="middle"
              disabled={disabled}
            >
              {cancelText || t('common.cancel')}
            </Button>
          </Popconfirm>
        ) : (
          <Button
            className="m-1"
            {...(!isMobile && { style: { width: buttonWidth || 132 } })}
            size="middle"
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelText || t('common.cancel')}
          </Button>
        ))}

      {okPopConfirmText ? (
        <Popconfirm
          title={okPopConfirmText || t('components.footer.confirmSave')}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
          onConfirm={onConfirm}
        >
          <Button
            className="m-1"
            {...(!isMobile && { style: { width: buttonWidth || 132 } })}
            type="primary"
            size="middle"
            {...(okIcon && { icon: okIcon })}
            disabled={disabled}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {okText || t('components.footer.save')}
          </Button>
        </Popconfirm>
      ) : (
        <Button
          className="m-1"
          {...(!isMobile && { style: { width: 140 } })}
          type="primary"
          onClick={onConfirm}
          size="middle"
          {...(okIcon && { icon: okIcon })}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {okText || t('components.footer.save')}
        </Button>
      )}
    </>
  );

  if (extraButtons) {
    return isMobile ? (
      <div
        className={`flex p-4 border-t border-gray-200 dark:border-gray-700 ${
          alignRight ? 'justify-end' : ''
        } ${isMobile ? 'flex-col' : ''} ${className}`}
      >
        {extraButtons}
        {Buttons}
      </div>
    ) : (
      <div className="flex p-4 border-t border-gray-200 dark:border-gray-700">
        <Row className="w-full" justify="space-between">
          <Col span={12}>{extraButtons}</Col>
          <Col span={12}>
            <div className="flex justify-end">{Buttons}</div>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div
      className={`flex p-4 border-t border-gray-200 dark:border-gray-700 ${
        alignRight ? 'justify-end' : ''
      } ${isMobile ? 'flex-col' : ''} ${className}`}
    >
      {Buttons}
    </div>
  );
};

export default Footer;

// Ensure all company name references use t('footer.companyName') and are set to 'KBN' in translations
