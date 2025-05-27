import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'elements';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import HiddenItem from './HiddenItem';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useModal } from '../contexts/ModalContext';
import CustomerSelector from 'modules/Customers/CustomerSelector';
import { AnimateKeyframes } from 'react-simple-animate';
import { partialText } from 'utils';

const { Text } = Typography;

/**
 * Customer Component
 *
 * A comprehensive customer selection and management component with search functionality.
 * Features include customer lookup, automatic form population, and responsive design.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.grant - Whether user has permission to edit
 * @param {Function} props.onClick - Click handler for more info button
 * @param {Function} props.onChange - Change handler for customer data
 * @param {Object} props.values - Form values
 * @param {Object} props.errors - Form errors
 * @param {Object} props.form - Ant Design form instance
 * @param {string} props.size - Input size
 * @param {boolean} props.notRequired - Whether customer selection is not required
 * @param {boolean} props.readOnly - Whether component is read-only
 * @param {boolean} props.noMoreInfo - Whether to hide additional info button
 * @param {Function} props.onSelect - Customer selection callback
 * @returns {React.ReactElement} Customer component
 */
const Customer = ({
  grant,
  onClick,
  values,
  form,
  size,
  notRequired,
  readOnly,
  noMoreInfo,
  onSelect,
}) => {
  const { t } = useTranslation('components');
  const { showWarning } = useModal();
  const [customerName, setCustomerName] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    let cName =
      values?.customer ||
      `${values?.prefix || ''}${values?.firstName || ''} ${values?.lastName || ''}`.trim();
    if (cName === 'นาย') {
      cName = null;
    }
    setCustomerName(cName);
  }, [values]);

  /**
   * Handle customer selection from selector
   * @param {string} customerId - Selected customer ID
   */
  const _onSelect = async (customerId) => {
    try {
      const docRef = doc(firestore, 'data', 'sales', 'customers', customerId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let customer = docSnap.data();
        form.setFieldsValue({
          customerId,
          ...(customer?.customerNo && {
            customerNo: customer?.customerNo,
          }),
          prefix: customer.prefix,
          firstName: customer.firstName,
          firstName_lower: customer.firstName.toLowerCase(),
          firstName_partial: partialText(customer.firstName),
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          customer:
            `${customer?.prefix || ''}${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
        });
        onSelect && onSelect({ ...customer, customerId });
      }
    } catch (e) {
      showWarning(e.message || t('common.error'));
    }
  };

  /**
   * Handle new customer addition
   * @param {Object} cus - Customer data
   */
  const _onCustomerAdd = (cus) => {
    if (cus) {
      form.setFieldsValue({
        ...(cus?.customerId && { customerId: cus.customerId }),
        ...(cus?.customerNo && { customerNo: cus.customerNo }),
        ...(cus?.prefix && { prefix: cus.prefix }),
        ...(cus?.firstName && {
          firstName: cus.firstName,
          firstName_lower: cus.firstName.toLowerCase(),
          firstName_partial: partialText(cus.firstName),
        }),
        ...(cus?.lastName && { lastName: cus.lastName }),
        ...(cus?.phoneNumber && { phoneNumber: cus.phoneNumber }),
        ...(cus?.address && { address: cus.address }),
        customer: `${cus?.prefix || ''}${cus?.firstName || ''} ${cus?.lastName || ''}`.trim(),
      });
    }
  };

  return (
    <AnimateKeyframes keyframes={['opacity: 0', 'opacity: 1']}>
      <HiddenItem name="prefix" />
      <HiddenItem
        name="firstName"
        required={!notRequired}
        message={t('customer.validation.nameRequired')}
      />
      <HiddenItem name="lastName" />

      {readOnly || !grant ? (
        <>
          <HiddenItem name="customerId" />
        </>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={8}>
            <Form.Item
              name="customerId"
              label={
                <span className="flex items-center gap-2">
                  <SearchOutlined className="text-blue-500" />
                  <Text className="text-gray-700 dark:text-gray-300">
                    {t('customer.searchLabel')}
                  </Text>
                </span>
              }
              rules={!notRequired ? getRules(['required']) : []}
              className={formItemClass}
            >
              <CustomerSelector
                size={size || 'default'}
                onChange={_onSelect}
                disabled={!grant || readOnly}
                onAddCallback={_onCustomerAdd}
                placeholder={t('customer.searchPlaceholder')}
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} align="top">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item label={t('customer.customerName')} className={formItemClass}>
            <Input
              readOnly
              value={customerName}
              className="text-blue-600 dark:text-blue-400 font-medium"
              placeholder={t('customer.noCustomerSelected')}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            name="phoneNumber"
            label={t('customer.phoneNumber')}
            className={formItemClass}
            rules={getRules(['mobileNumber'])}
          >
            <Input
              mask="111-1111111"
              placeholder="012-3456789"
              disabled={!grant || readOnly}
              focusNextField={3}
            />
          </Form.Item>
        </Col>

        {!noMoreInfo && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label={t('customer.moreInfo')} className={formItemClass}>
              <Button
                onClick={onClick}
                className="w-full mt-1 border-dashed hover:border-blue-500 dark:hover:border-blue-400"
                disabled={!values.customerId || !grant || readOnly}
                type="dashed"
              >
                {t('customer.moreInfoButton')} →
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </AnimateKeyframes>
  );
};

export default Customer;
