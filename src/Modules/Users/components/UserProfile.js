import React from 'react';
import { Row, Col } from 'shards-react';

import PageTitle from 'components/common/PageTitle';
import UserDetails from './UserDetails';
import UserAccountDetails from './UserAccountDetails';
import { showLog } from 'functions';

const UserProfile = ({ onCancel, app, api, selectedUser }) => {
  showLog({ selectedUser });
  return (
    <div className="px-3">
      <Row noGutters className="page-header my-3">
        <PageTitle title="User Profile" subtitle="Overview" md="12" />
      </Row>
      <Row>
        <Col lg="4">
          <UserDetails app={app} api={api} selectedUser={selectedUser} />
        </Col>
        <Col lg="8">
          <UserAccountDetails app={app} api={api} selectedUser={selectedUser} onCancel={onCancel} />
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;
