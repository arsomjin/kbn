import React from 'react';
import { Row, Col } from 'shards-react';

import PageTitle from 'components/common/PageTitle';
import EmpDetails from './EmpDetails';
import EmployeeAccountDetails from './EmployeeAccountDetails';

const EmployeeProfile = ({ onCancel, app, api, selectedEmployee, isEdit }) => {
  // showLog({ selectedEmployee, isEdit });
  return (
    <div className="px-3">
      <Row noGutters className="page-header my-3">
        <PageTitle title="ข้อมูลส่วนตัว" subtitle="พนักงาน" md="12" />
      </Row>
      <Row>
        <Col lg="4">
          <EmpDetails app={app} api={api} selectedEmployee={selectedEmployee} />
        </Col>
        <Col lg="8">
          <EmployeeAccountDetails
            app={app}
            api={api}
            selectedEmployee={selectedEmployee}
            onCancel={onCancel}
            isEdit={isEdit}
          />
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeProfile;
