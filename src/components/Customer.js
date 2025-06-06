import React, { useEffect, useState } from 'react';

import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { Button, Input } from 'elements';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import HiddenItem from './HiddenItem';
import { checkDoc } from 'firebase/api';
import { showWarn } from 'functions';
import { load } from 'functions';
import CustomerSelector from 'Modules/Customers/CustomerSelector';
import { AnimateKeyframes } from 'react-simple-animate';
import Text from 'antd/lib/typography/Text';
import { partialText } from 'utils';

const Customer = ({
  grant,
  onClick,
  onChange,
  values,
  errors,
  form,
  size,
  notRequired,
  readOnly,
  noMoreInfo,
  onSelect
}) => {
  const [customerName, setCustomerName] = useState(null);

  useEffect(() => {
    // showLog('Customer_Values', values);
    let cName =
      values?.customer || `${values?.prefix || ''}${values?.firstName || ''} ${values?.lastName || ''}`.trim();
    if (cName === 'นาย') {
      cName = null;
    }
    setCustomerName(cName);
    // showLog({ cName });
  }, [values]);

  const _onSelect = async customerId => {
    // showLog('On_Customer_Change', customerId);
    try {
      load(true);
      const doc = await checkDoc('data', `sales/customers/${customerId}`);
      if (doc) {
        let customer = doc.data();
        form.setFieldsValue({
          customerId,
          ...(customer?.customerNo && {
            customerNo: customer?.customerNo
          }),
          prefix: customer.prefix,
          firstName: customer.firstName,
          firstName_lower: customer.firstName.toLowerCase(),
          firstName_partial: partialText(customer.firstName),
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          customer: `${customer?.prefix || ''}${customer?.firstName || ''} ${customer?.lastName || ''}`.trim()
        });
        // onChange && onChange(customer);
        onSelect && onSelect({ ...customer, customerId });
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onCustomerAdd = cus => {
    if (!!cus) {
      form.setFieldsValue({
        ...(!!cus?.customerId && { customerId: cus.customerId }),
        ...(!!cus?.customerNo && { customerNo: cus.customerNo }),
        ...(!!cus?.prefix && { prefix: cus.prefix }),
        ...(!!cus?.firstName && {
          firstName: cus.firstName,
          firstName_lower: cus.firstName.toLowerCase(),
          firstName_partial: partialText(cus.firstName)
        }),
        ...(!!cus?.lastName && { lastName: cus.lastName }),
        ...(!!cus?.phoneNumber && { phoneNumber: cus.phoneNumber }),
        ...(!!cus?.address && { address: cus.address }),
        customer: `${cus?.prefix || ''}${cus?.firstName || ''} ${cus?.lastName || ''}`.trim()
      });
    }
  };

  return (
    <AnimateKeyframes keyframes={['opacity: 0', 'opacity: 1']}>
      <HiddenItem name="prefix" />
      <HiddenItem name="firstName" required={!notRequired} message="กรุณาป้อนชื่อลูกค้า" />
      <HiddenItem name="lastName" />
      {readOnly || !grant ? (
        <>
          <HiddenItem name="customerId" />
        </>
      ) : (
        <Row form>
          <Col md="6">
            <Form.Item
              name="customerId"
              label={
                <span role="img" aria-label="search">
                  🔍
                  <Text className="ml-3">ค้นหา ชื่อลูกค้า, นามสกุล, เบอร์โทร</Text>
                </span>
              }
              rules={getRules(['required'])}
            >
              <CustomerSelector
                size="small"
                onChange={_onSelect}
                disabled={!grant || readOnly}
                onAddCallback={_onCustomerAdd}
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row form>
        <Col md="4">
          <Form.Item label="ชื่อ-นามสกุล ลูกค้า">
            <Input readOnly value={customerName} className="text-primary" />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            name="phoneNumber"
            label="เบอร์โทรศัพท์"
            className={formItemClass}
            rules={getRules(['mobileNumber'])}
          >
            <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant || readOnly} focusNextField={3} />
          </Form.Item>
        </Col>
        {!noMoreInfo && (
          <Col md="2" className="pb-3">
            <Form.Item label="รายละเอียด" className={formItemClass}>
              <Button
                onClick={onClick}
                className="btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
                disabled={!values.customerId || !grant || readOnly}
              >
                ข้อมูลลูกค้าเพิ่มเติม &rarr;
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </AnimateKeyframes>
  );
};

export default Customer;
