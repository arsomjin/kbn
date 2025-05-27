import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import BankNameSelector from './BankNameSelector';

/**
 * BankAccount - Modern bank account information form component
 * @param {Object} props - Component props
 * @param {Array} props.parent - Parent form field path
 * @param {boolean} props.disabled - Disable all form controls
 * @param {boolean} props.noLabel - Hide section label
 * @param {boolean} props.readOnly - Make fields read-only
 * @param {boolean} props.notRequired - Remove required validation
 */
const BankAccount = ({
  parent,
  disabled = false,
  noLabel = false,
  readOnly = false,
  notRequired = false,
}) => {
  const { t } = useTranslation();

  /**
   * Get field path with parent namespace
   */
  const getParent = (field) => (parent ? [...parent, field] : ['bankAccount', field]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {!noLabel && (
        <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
          {t('components.bankAccount.title')}
        </h3>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('bankName')}
            label={t('components.bankAccount.accountName')}
            rules={[
              {
                required: !notRequired,
                message: t('components.bankAccount.validation.accountNameRequired'),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={t('components.bankAccount.accountNamePlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
              className="w-full"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('bank')}
            label={t('components.bankAccount.bankName')}
            rules={[
              {
                required: !notRequired,
                message: t('components.bankAccount.validation.bankNameRequired'),
              },
            ]}
            className="mb-3"
          >
            <BankNameSelector
              placeholder={t('components.bankAccount.bankNamePlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('bankAcc')}
            label={t('components.bankAccount.accountNumber')}
            rules={[
              {
                required: !notRequired,
                message: t('components.bankAccount.validation.accountNumberRequired'),
              },
              {
                pattern: /^[0-9-]+$/,
                message: t('components.bankAccount.validation.accountNumberInvalid'),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={t('components.bankAccount.accountNumberPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
              maxLength={20}
              className="w-full"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('bankBranch')}
            label={t('components.bankAccount.branch')}
            className="mb-3"
          >
            <Input
              placeholder={t('components.bankAccount.branchPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default BankAccount;
