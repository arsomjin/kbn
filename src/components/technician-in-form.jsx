import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Button } from 'antd';
import { SearchSelect } from 'elements';
import { useSelector } from 'react-redux';
import { FInput } from 'Formiks';

/**
 * TechnicianInForm Component
 *
 * A form component for selecting and managing technician information.
 * Provides technician search, selection, and additional data fields.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.grant - Whether user has permission to edit
 * @param {Function} props.onClick - Callback function for button click
 * @param {Object} props.values - Form values
 * @param {Object} props.errors - Form validation errors
 * @param {Function} props.setFieldValue - Function to set form field values
 * @returns {React.ReactElement} Technician form component
 */
const TechnicianInForm = ({ grant, onClick, values, errors, setFieldValue }) => {
  const { t } = useTranslation();
  const { employees } = useSelector((state) => state.data);

  let employeeOptions = Object.keys(employees).map((key) => ({
    value: key,
    label: `${employees[key].firstName}${
      employees[key]?.nickName ? `(${employees[key].nickName})` : ''
    } ${employees[key].lastName}`,
  }));

  employeeOptions = employeeOptions.filter(
    (l) => employees[l.value].position && employees[l.value].position.indexOf('ช่าง') > -1,
  );

  const handleTechnicianChange = (val) => {
    setFieldValue('technicianId', val.value);
    employees[val.value].employeeCode &&
      setFieldValue('technicianNo', employees[val.value].employeeCode);
    setFieldValue('technicianFirstName', employees[val.value].firstName);
    setFieldValue('technicianLastName', employees[val.value].lastName);
    setFieldValue('technicianPhoneNumber', employees[val.value].phoneNumber || '');
  };

  return (
    <Fragment>
      <Row gutter={[16, 16]} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <Col xs={24} sm={12} md={12} lg={9}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('components.technicianInForm.technicianName')}
          </label>
          <SearchSelect
            id="displayName"
            type="text"
            placeholder={t('components.technicianInForm.placeholder')}
            error={errors.technicianId || errors.technicianFirstName}
            onChange={handleTechnicianChange}
            options={employeeOptions}
            defaultValue={employeeOptions.filter((l) => l.value === values.technicianId)}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('components.technicianInForm.phoneNumber')}
          </label>
          <FInput
            name="technicianPhoneNumber"
            placeholder={t('components.technicianInForm.phoneNumberPlaceholder')}
            disabled={!grant}
            focusNextField={3}
          />
        </Col>

        <Col xs={24} sm={24} md={8} lg={6} className="flex items-end">
          <Button
            onClick={onClick}
            size="small"
            className="w-full sm:w-auto mt-4 sm:mt-0"
            type="default"
          >
            {values.technicianId
              ? t('components.technicianInForm.additionalInfo')
              : t('components.technicianInForm.addTechnician')}{' '}
            &rarr;
          </Button>
        </Col>
      </Row>
    </Fragment>
  );
};

export default TechnicianInForm;
