import React from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import PageTitle from 'components/common/PageTitle';
import EmpDetails from './EmpDetails';
import EmployeeAccountDetails from './EmployeeAccountDetails';
import { useResponsive } from 'hooks/useResponsive';

export const EmployeeProfile = ({ onCancel, selectedEmployee, isEdit }) => {
  const { t } = useTranslation('employees');
  const { isMobile } = useResponsive();

  return (
    <div className={`${isMobile ? 'px-0' : 'px-3'}`}>
      <Row className="page-header my-3">
        <PageTitle title={t('profile.title')} subtitle={t('profile.subtitle')} md="12" />
      </Row>
      <Row className="justify-center">
        <Col lg={8}>
          <EmpDetails selectedEmployee={selectedEmployee} />
        </Col>
        <Col lg={16}>
          <EmployeeAccountDetails
            selectedEmployee={selectedEmployee}
            onCancel={onCancel}
            isEdit={isEdit}
          />
        </Col>
      </Row>
    </div>
  );
};
