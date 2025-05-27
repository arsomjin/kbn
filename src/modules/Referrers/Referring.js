import React from 'react';
import { Form, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useResponsive } from 'hooks/useResponsive';
import { getRules } from 'api/Table';
import BankNameSelector from 'components/BankNameSelector';
import BranchSelector from 'components/BranchSelector';
import { DatePicker, Input, InputGroup } from 'elements';

const Referring = ({ hasReferrer, grant, readOnly }) => {
  const { t } = useTranslation('referrers');
  const { isMobile } = useResponsive();

  return (
    <div className="border p-3 bg-light mb-3">
      {/* <label className="text-muted">รายละเอียดค่าแนะนำ</label> */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item
            name={['referringDetails', 'relationship']}
            rules={!hasReferrer ? undefined : [...getRules(['required'])]}
            label={t('referring.relationship')}
          >
            <Input disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item label={t('referring.branchRequest')} name={['referringDetails', 'branchCode']}>
            <BranchSelector disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item label={t('referring.date')} name={['referringDetails', 'date']}>
            <DatePicker disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} className={!isMobile ? 'border-right' : ''}>
          <Form.Item
            name="amtReferrer"
            rules={!hasReferrer ? undefined : [...getRules(['number', 'required'])]}
          >
            <InputGroup
              spans={[10, 10, 4]}
              addonBefore={t('referring.amount')}
              disabled={!grant || readOnly}
              currency
              addonAfter={t('referring.baht')}
            />
          </Form.Item>
          <Form.Item name={['referringDetails', 'whTax']}>
            <InputGroup
              spans={[10, 10, 4]}
              addonBefore={t('referring.withholding')}
              disabled
              currency
              addonAfter={t('referring.baht')}
            />
          </Form.Item>
          <Form.Item
            name={['referringDetails', 'total']}
            rules={!hasReferrer ? undefined : [...getRules(['number'])]}
          >
            <InputGroup
              spans={[10, 10, 4]}
              addonBefore={t('referring.netAmount')}
              disabled
              currency
              addonAfter={t('referring.baht')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item name={['referringDetails', 'bankName']}>
            <InputGroup
              spans={[10, 14]}
              addonBefore={t('referring.bankName')}
              disabled={!grant || readOnly}
            />
          </Form.Item>
          <Form.Item name={['referringDetails', 'bank']}>
            <InputGroup
              spans={[10, 14]}
              addonBefore={t('referring.bank')}
              inputComponent={(props) => <BankNameSelector {...props} />}
              disabled={!grant || readOnly}
            />
          </Form.Item>
          <Form.Item name={['referringDetails', 'bankAcc']}>
            <InputGroup
              spans={[10, 14]}
              addonBefore={t('referring.accountNumber')}
              disabled={!grant || readOnly}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default Referring;
