import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'antd';
import { Input, Button } from 'elements';
import { useSelector } from 'react-redux';
import HiddenItem from './HiddenItem';
import { Form, Select } from 'antd';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';

const { Option } = Select;

/**
 * TechnicianInForm Component
 *
 * A form component for selecting and managing technician information with hidden fields.
 * Provides comprehensive technician selection with automatic field population.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.grant - Whether user has permission to edit
 * @param {Function} props.onClick - Callback function for button click
 * @param {Object} props.values - Form values
 * @param {Object} props.form - Ant Design form instance
 * @returns {React.ReactElement} Technician form component
 */
const TechnicianInForm = ({ grant, onClick, values, form }) => {
  const { t } = useTranslation();
  const { employees } = useSelector((state) => state.data);

  let employeeArr = Object.keys(employees)
    .map((k) => ({ ...employees[k], _key: k }))
    .filter((l) => l?.position && l.position.indexOf('ช่าง') > -1);

  let employeeOptions = employeeArr.map((l) => (
    <Option key={l._key} value={l._key}>
      {`${l.firstName}${l?.nickName ? `(${l.nickName})` : ''} ${l.lastName}`}
    </Option>
  ));

  return (
    <Fragment>
      <Row gutter={[16, 16]} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <HiddenItem name="technicianId" />
        <HiddenItem name="technicianNo" />
        <HiddenItem name="technicianPrefix" />
        <HiddenItem
          name="technicianFirstName"
          required
          message={t('components.technician.requiredName')}
        />

        <Col xs={24} sm={12} md={12} lg={9}>
          <Form.Item name="technicianId" label={t('components.technician.label')}>
            <Select
              showSearch
              placeholder={t('components.technician.placeholder')}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              dropdownStyle={{ minWidth: 280 }}
              mode="tags"
            >
              {employeeOptions}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item
            name="technicianPhoneNumber"
            label={t('components.technician.phoneNumber')}
            className={formItemClass}
            rules={getRules(['mobileNumber'])}
          >
            <Input
              mask="111-1111111"
              placeholder="012-3456789"
              disabled={!grant}
              focusNextField={3}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={8} lg={6}>
          <Form.Item label={t('components.technician.technicianInfo')} className={formItemClass}>
            <Button onClick={onClick} className="w-full sm:w-auto" type="default">
              {values.technicianId
                ? t('components.technician.additionalInfo')
                : t('components.technician.addTechnician')}{' '}
              &rarr;
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};

export default TechnicianInForm;
